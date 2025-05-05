import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Calendar from '../components/Calendar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CalendarPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());

  // Simulate loading time for calendar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 250, damping: 20 }
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen py-8 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8"
        >
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold">Calendar View</h1>
            <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg flex items-center ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} shadow-sm transition-colors duration-200`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Dashboard
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/add-task"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Task
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="loader">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-lg">Loading your calendar...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Calendar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="lg:col-span-2"
            >
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg border overflow-hidden`}>
                <div className={`p-5 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <h2 className="text-lg font-semibold">Task Calendar</h2>
                </div>
                <div className="p-5">
                  <Calendar />
                </div>
              </div>
            </motion.div>

            {/* Side column */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg p-6 border overflow-hidden`}
              >
                <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-5`}>Legend & Tips</h2>
                <ul className="space-y-4">
                  <motion.li whileHover={{ x: 5 }} className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 mr-3 mt-1"></div>
                    <p>Today's date is highlighted in blue</p>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 mr-3 mt-1"></div>
                    <p>Green dots indicate days with scheduled tasks</p>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-yellow-500 mr-3 mt-1"></div>
                    <p>Yellow indicators show days with high-priority tasks</p>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }} className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 mr-3 mt-1"></div>
                    <p>Red indicators highlight days with overdue tasks</p>
                  </motion.li>
                </ul>
                <div className={`mt-5 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <p className="text-sm">
                    <span className="font-semibold">Pro Tip:</span> Click on any date to see detailed tasks for that day or to add a new task.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg p-6 border`}
              >
                <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-5`}>Quick Actions</h2>
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/add-task" className={`flex items-center p-3 ${darkMode ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50" : "bg-blue-50 text-blue-700 hover:bg-blue-100"} rounded-lg transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Task
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/tasks" className={`flex items-center p-3 ${darkMode ? "bg-green-900/30 text-green-300 hover:bg-green-900/50" : "bg-green-50 text-green-700 hover:bg-green-100"} rounded-lg transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      View All Tasks
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/pomodoro" className={`flex items-center p-3 ${darkMode ? "bg-red-900/30 text-red-300 hover:bg-red-900/50" : "bg-red-50 text-red-700 hover:bg-red-100"} rounded-lg transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pomodoro Timer
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/spaced-repetition" className={`flex items-center p-3 ${darkMode ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50" : "bg-purple-50 text-purple-700 hover:bg-purple-100"} rounded-lg transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      Flashcards
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CalendarPage;
