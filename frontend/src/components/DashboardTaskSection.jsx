import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import DashboardTaskCard from "./DashboardTaskCard";

const DashboardTaskSection = ({ title, tasks = [], icon, onStatusChange, emptyMessage, color = "blue" }) => {
  const { darkMode } = useContext(ThemeContext);
  
  // Ensure tasks is always an array
  const safeTaskList = Array.isArray(tasks) ? tasks : [];
  
  const colorClasses = {
    blue: darkMode 
      ? "bg-blue-900/30 border-blue-700 text-blue-300" 
      : "bg-blue-50 border-blue-200 text-blue-800",
    red: darkMode 
      ? "bg-red-900/30 border-red-700 text-red-300" 
      : "bg-red-50 border-red-200 text-red-800",
    green: darkMode 
      ? "bg-green-900/30 border-green-700 text-green-300" 
      : "bg-green-50 border-green-200 text-green-800",
    yellow: darkMode 
      ? "bg-yellow-900/30 border-yellow-700 text-yellow-300" 
      : "bg-yellow-50 border-yellow-200 text-yellow-800"
  };
  
  return (
    <div className={`mb-8 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md p-5 border`}>
      <div className={`flex items-center mb-4 px-3 py-1.5 rounded-lg ${colorClasses[color]}`}>
        <span className="text-xl mr-2">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      
      {safeTaskList.length > 0 ? (
        <div className="space-y-3">
          {safeTaskList.map((task) => (
            task && task._id ? (
              <DashboardTaskCard key={task._id} task={task} onStatusChange={onStatusChange} />
            ) : null
          ))}
        </div>
      ) : (
        <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {emptyMessage}
        </p>
      )}
    </div>
  );
};

export default DashboardTaskSection;
