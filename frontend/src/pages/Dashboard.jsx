import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardTaskSection from "../components/DashboardTaskSection";
import DashboardProgressStats from "../components/DashboardProgressStats";
import GamificationWidget from "../components/GamificationWidget";
import { motion } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  // Set initial state with safe default values for all tasks
  const [taskData, setTaskData] = useState({
    todaysTasks: [],
    dueTasks: [],
    completedTasks: [],
    upcomingTasks: [],
    pendingTasks: [],
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      pendingTasks: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true); // New state for auth checking
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data has been loaded at least once

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Function to fetch task statistics
  const fetchTaskStats = async () => {
    if (!dataLoaded) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No auth token found");
      }
      
      const res = await axios.get("http://localhost:5000/api/tasks/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Ensure all task arrays are properly initialized even if the API doesn't return them
      const safeTaskData = {
        todaysTasks: Array.isArray(res.data.todaysTasks) ? res.data.todaysTasks : [],
        dueTasks: Array.isArray(res.data.dueTasks) ? res.data.dueTasks : [],
        completedTasks: Array.isArray(res.data.completedTasks) ? res.data.completedTasks : [],
        upcomingTasks: Array.isArray(res.data.upcomingTasks) ? res.data.upcomingTasks : [],
        pendingTasks: Array.isArray(res.data.pendingTasks) ? res.data.pendingTasks : [],
        stats: res.data.stats || {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          notStartedTasks: 0,
          pendingTasks: 0
        }
      };
      
      setTaskData(safeTaskData);
      setDataLoaded(true);
    } catch (err) {
      console.error("Error fetching tasks stats:", err);
      setError("Failed to load task data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setAuthChecking(false); // Always set authChecking to false after loading
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update tasks");
        return;
      }
      
      // Optimistically update the UI
      const updateTaskInList = (list) => {
        return list.map(task => 
          task._id === taskId 
            ? { ...task, status: newStatus } 
            : task
        );
      };
      
      setTaskData(prev => ({
        ...prev,
        todaysTasks: updateTaskInList(prev.todaysTasks),
        dueTasks: updateTaskInList(prev.dueTasks),
        upcomingTasks: updateTaskInList(prev.upcomingTasks),
        completedTasks: newStatus === "Completed"
          ? [...(prev.completedTasks || []), { ...prev.todaysTasks.find(t => t._id === taskId), status: "Completed" }]
          : prev.completedTasks?.filter(task => task._id !== taskId) || []
      }));
      
      // Actually update on the server
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Fetch updated task stats to refresh the UI
      fetchTaskStats();
      
      // Show a success message
      toast.success(`Task marked as ${newStatus}`);
      
      // If completing a task, award points through gamification system
      if (newStatus === "Completed") {
        try {
          await axios.post(
            "http://localhost:5000/api/gamify/task-complete",
            { taskId },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } catch (error) {
          console.error("Error awarding points:", error);
          // Don't show an error toast as this is a non-critical operation
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task. Please try again.");
      
      // Revert the optimistic UI update
      fetchTaskStats();
    }
  };
  
  // Check auth and load data on component mount
  useEffect(() => {
    const loadDashboard = async () => {
      // Check for token directly to avoid waiting for authChecking state
      const token = localStorage.getItem("token");
      
      if (token) {
        // Token exists, proceed with data fetch
        fetchTaskStats();
      } else {
        // No token, redirect to login
        setAuthChecking(false);
        setLoading(false);
        navigate("/login");
      }
      
      // Add a safety timeout to ensure we don't stay in loading state forever
      setTimeout(() => {
        setAuthChecking(false);
        setLoading(false);
      }, 3000);
    };
    
    loadDashboard();
  }, [navigate]);
  
  // Handle "Add Task" button click
  const handleAddTaskClick = () => {
    navigate("/add-task");
  };
  
  const handleRefreshData = () => {
    fetchTaskStats();
  };
  
  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  return (
    <div className={`min-h-screen py-6 transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"}`}>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        {authChecking && loading && !dataLoaded ? (
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {/* Dashboard Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h2 className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"} font-medium mb-1`}>
                  Welcome, {user?.name || 'Student'}! 👋
                </h2>
                <h1 className="text-3xl font-bold">StudyBuddy Dashboard</h1>
                <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex space-x-3 mt-4 md:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTaskClick}
                  className={`px-4 py-2 rounded-md ${darkMode 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-500 hover:bg-blue-600"} text-white flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Task
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefreshData}
                  className={`p-2 rounded-md ${darkMode 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCalendarClick}
                  className={`p-2 rounded-md ${darkMode 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Loading State */}
            {loading && dataLoaded ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-10 ${darkMode ? "text-red-400" : "text-red-600"}`}
              >
                <p>{error}</p>
                <button
                  onClick={handleRefreshData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <div>
                {/* Progress Stats Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <DashboardProgressStats stats={taskData.stats} />
                </motion.div>
                
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task sections - 2 columns on larger screens */}
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      {/* Today's tasks */}
                      <motion.div variants={itemVariants}>
                        <DashboardTaskSection 
                          title="Today's Tasks" 
                          tasks={taskData.todaysTasks} 
                          icon="📝" 
                          onStatusChange={handleStatusChange}
                          emptyMessage="No tasks scheduled for today"
                          color="blue"
                        />
                      </motion.div>
                      
                      {/* Overdue tasks */}
                      <motion.div variants={itemVariants}>
                        <DashboardTaskSection 
                          title="Overdue Tasks" 
                          tasks={taskData.dueTasks} 
                          icon="⏰" 
                          onStatusChange={handleStatusChange}
                          emptyMessage="No overdue tasks"
                          color="red"
                        />
                      </motion.div>
                      
                      {/* Upcoming tasks */}
                      <motion.div variants={itemVariants}>
                        <DashboardTaskSection 
                          title="Upcoming Tasks" 
                          tasks={taskData.upcomingTasks} 
                          icon="🔮" 
                          onStatusChange={handleStatusChange}
                          emptyMessage="No upcoming tasks scheduled"
                          color="yellow"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Side column */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:w-full space-y-6"
                  >
                    {/* Gamification Widget */}
                    <GamificationWidget />
                  
                    {/* Quick actions card */}
                    <motion.div 
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md p-5 mb-8 border transition-all duration-300`}
                    >
                      <h2 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}>Quick Actions</h2>
                      <div className="space-y-3">
                        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/add-task" className={`flex items-center p-3 ${darkMode ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50" : "bg-blue-50 text-blue-700 hover:bg-blue-100"} rounded-lg transition-all duration-300`}>
                            <span className="mr-2">➕</span>
                            Add New Task
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/tasks" className={`flex items-center p-3 ${darkMode ? "bg-green-900/30 text-green-300 hover:bg-green-900/50" : "bg-green-50 text-green-700 hover:bg-green-100"} rounded-lg transition-all duration-300`}>
                            <span className="mr-2">📋</span>
                            View All Tasks
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/calendar" className={`flex items-center p-3 ${darkMode ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50" : "bg-purple-50 text-purple-700 hover:bg-purple-100"} rounded-lg transition-all duration-300`}>
                            <span className="mr-2">📅</span>
                            Calendar View
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Recently completed tasks */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md p-5 border`}
                    >
                      <h2 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}>Recently Completed</h2>
                      {taskData.completedTasks && taskData.completedTasks.length > 0 ? (
                        <div className="space-y-3">
                          {taskData.completedTasks.slice(0, 5).map((task, index) => (
                            <motion.div 
                              key={task._id || index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center p-2 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                            >
                              <div className={`${darkMode ? "bg-green-900/30" : "bg-green-100"} p-1 rounded-full mr-3`}>
                                <svg className={`h-5 w-5 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium line-through ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{task.subject}</p>
                                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                  {new Date(task.updatedAt || Date.now()).toLocaleDateString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No completed tasks yet</p>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;
