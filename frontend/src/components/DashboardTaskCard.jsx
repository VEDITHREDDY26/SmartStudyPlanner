import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";

const DashboardTaskCard = ({ task, onStatusChange }) => {
  // Add safety check for null/undefined task
  if (!task || !task._id) {
    return null; // Don't render anything if task is invalid
  }

  const { darkMode } = useContext(ThemeContext);
  
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-500";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-500";
      case "Low": return "bg-green-100 text-green-800 border-green-500";
      default: return "bg-gray-100 text-gray-800 border-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Not Started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Safely access task properties with defaults
  const {
    _id = '',
    subject = 'Untitled Task',
    description = '',
    priority = 'Medium',
    status = 'Not Started',
    targetDateTime = null
  } = task;

  const handleStatusChange = async (newStatus) => {
    try {
      // Call the original onStatusChange
      await onStatusChange(task._id, newStatus);
      
      // If task is being marked as completed, update progress
      if (newStatus === "Completed") {
        await axios.post('/api/progress/completed-tasks');
        
        // Check if task was completed before 9 AM for Early Bird achievement
        const now = new Date();
        if (now.getHours() < 9) {
          await axios.post('/api/progress/early-bird-task');
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4 mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id={`task-checkbox-${_id}`}
            name={`task-checkbox-${_id}`}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            checked={status === "Completed"}
            onChange={() => handleStatusChange(status === "Completed" ? "Not Started" : "Completed")}
          />
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${status === "Completed" ? "line-through text-gray-500" : darkMode ? "text-gray-200" : "text-gray-900"}`}>
              {subject}
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
              {description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(priority)}`}>
            {priority}
          </span>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
            {formatDate(targetDateTime)}
          </span>
        </div>
      </div>
      <div className={`mt-3 pt-2 border-t ${darkMode ? "border-gray-700" : "border-gray-100"} flex justify-between items-center`}>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
        <div className="space-x-2">
          <Link to={`/edit-task/${_id}`} className="text-xs text-blue-600 hover:text-blue-800">
            Edit
          </Link>
          <Link to={`/tasks`} className="text-xs text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardTaskCard;
