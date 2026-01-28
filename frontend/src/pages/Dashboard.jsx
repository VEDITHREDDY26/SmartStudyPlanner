import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardTaskSection from "../components/DashboardTaskSection";
import DashboardProgressStats from "../components/DashboardProgressStats";
import GamificationWidget from "../components/GamificationWidget";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);

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
  const [authChecking, setAuthChecking] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  const fetchTaskStats = async () => {
    if (!dataLoaded) setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await axios.get(`${API_BASE_URL}/tasks/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const safeTaskData = {
        todaysTasks: Array.isArray(res.data.todaysTasks) ? res.data.todaysTasks : [],
        dueTasks: Array.isArray(res.data.dueTasks) ? res.data.dueTasks : [],
        completedTasks: Array.isArray(res.data.completedTasks) ? res.data.completedTasks : [],
        upcomingTasks: Array.isArray(res.data.upcomingTasks) ? res.data.upcomingTasks : [],
        pendingTasks: Array.isArray(res.data.pendingTasks) ? res.data.pendingTasks : [],
        stats: res.data.stats || {
          totalTasks: 0, completedTasks: 0, inProgressTasks: 0, notStartedTasks: 0, pendingTasks: 0
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
      setAuthChecking(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update tasks");
        return;
      }

      const updateTaskInList = (list) => {
        return list.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
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

      await axios.put(`${API_BASE_URL}/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTaskStats();
      toast.success(`Task marked as ${newStatus}`);

      if (newStatus === "Completed") {
        try {
          await axios.post(
            `${API_BASE_URL}/gamify/task-complete`,
            { taskId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error("Error awarding points:", error);
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task. Please try again.");
      fetchTaskStats();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Task deleted successfully");
      fetchTaskStats();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetchTaskStats();
      } else {
        setAuthChecking(false);
        setLoading(false);
        navigate("/login");
      }
      setTimeout(() => {
        setAuthChecking(false);
        setLoading(false);
      }, 3000);
    };
    loadDashboard();
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {authChecking && loading && !dataLoaded ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div>
          {/* Dashboard Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4"
          >
            <div>
              <h2 className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                Welcome back, {user?.name || user?.firstName || user?.email?.split('@')[0] || 'Student'}! 👋
              </h2>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white heading-gradient">
                Dashboard
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex space-x-3 mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/add-task")}
                className="glass-button flex items-center bg-indigo-600 text-white border-none hover:bg-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Task
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTaskStats}
                className="p-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all"
                title="Refresh Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/calendar")}
                className="p-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all"
                title="Calendar View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {loading && dataLoaded ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-red-400"
            >
              <p>{error}</p>
              <button
                onClick={fetchTaskStats}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
                  className="mb-10"
                >
                  <DashboardProgressStats stats={taskData.stats} />
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Task sections - 2 columns on larger screens */}
                  <div className="lg:col-span-2 space-y-10">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-10"
                    >
                      {/* Today's tasks */}
                      <motion.div variants={itemVariants}>
                        <DashboardTaskSection
                          title="Today's Tasks"
                          tasks={taskData.todaysTasks}
                          icon="📝"
                          onStatusChange={handleStatusChange}
                          onDelete={handleDeleteTask}
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
                          onDelete={handleDeleteTask}
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
                          onDelete={handleDeleteTask}
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
                    className="lg:w-full space-y-10"
                  >
                    {/* Gamification Widget */}
                    <GamificationWidget />

                    {/* Quick actions card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="glass-card p-6 border border-white/20 shadow-xl"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="mr-2">⚡</span> Quick Actions
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/add-task" className="flex items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all duration-300 border border-white/10 group">
                            <span className="mr-3 text-2xl group-hover:rotate-90 transition-transform duration-300">➕</span>
                            <span className="font-bold text-lg">Add New Task</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/tasks" className="flex items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all duration-300 border border-white/10">
                            <span className="mr-3 text-xl">📋</span>
                            <span className="font-bold">View All Tasks</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link to="/calendar" className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition-all duration-300 border border-white/10">
                            <span className="mr-3 text-xl">📅</span>
                            <span className="font-bold">Calendar View</span>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Recently completed tasks */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="glass-card p-6 border border-white/20 shadow-xl"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="mr-2">✅</span> Recently Completed
                      </h2>
                      {taskData.completedTasks && taskData.completedTasks.length > 0 ? (
                        <div className="space-y-4">
                          {taskData.completedTasks.slice(0, 5).map((task, index) => (
                            <motion.div
                              key={task._id || index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 shadow-sm"
                            >
                              <div className="bg-emerald-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-200 line-through truncate">{task.subject}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(task.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-white/5 rounded-xl border border-dashed border-slate-500/30">
                          <span className="text-2xl mb-2 opacity-50">💤</span>
                          <p>No completed tasks yet</p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default Dashboard;
