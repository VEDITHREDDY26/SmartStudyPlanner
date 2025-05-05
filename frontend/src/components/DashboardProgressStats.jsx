import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const DashboardProgressStats = ({ stats = {} }) => {
  const { darkMode } = useContext(ThemeContext);
  
  // Safely destructure stats with defaults
  const {
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    notStartedTasks = 0,
    streakDays = 0,
    bestStreak = 0
  } = stats || {};
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  
  return (
    <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md p-4 sm:p-5 mb-6 sm:mb-8 border`}>
      <h2 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-3 sm:mb-4`}>Progress Overview</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4">
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Tasks</p>
          <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{totalTasks}</p>
        </div>
        
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Completed</p>
          <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>{completedTasks}</p>
        </div>
        
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>In Progress</p>
          <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{inProgressTasks}</p>
        </div>
        
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Not Started</p>
          <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{notStartedTasks}</p>
        </div>
        
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Current Streak</p>
          <div className="flex items-center">
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>{streakDays}</p>
            <span className="ml-1 text-lg">🔥</span>
          </div>
        </div>
        
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 sm:p-3 rounded-lg`}>
          <p className={`text-xs uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Best Streak</p>
          <div className="flex items-center">
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>{bestStreak}</p>
            <span className="ml-1 text-lg">🏆</span>
          </div>
        </div>
      </div>
      
      <div className="mb-2 flex justify-between items-center">
        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Completion Rate</span>
        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{completionPercentage}%</span>
      </div>
      
      <div className={`w-full h-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DashboardProgressStats;
