import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import { motion } from "framer-motion";

const DashboardTaskCard = ({ task, onStatusChange, onDelete }) => {
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
      case "High": return "bg-red-500/10 dark:bg-red-500/30 text-red-700 dark:text-red-100 border-red-500/20 dark:border-red-500/40";
      case "Medium": return "bg-amber-500/10 dark:bg-amber-500/30 text-amber-700 dark:text-amber-100 border-amber-500/20 dark:border-amber-500/40";
      case "Low": return "bg-emerald-500/10 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-100 border-emerald-500/20 dark:border-emerald-500/40";
      default: return "bg-slate-500/10 dark:bg-slate-500/30 text-slate-700 dark:text-slate-200 border-slate-500/20 dark:border-slate-500/40";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-500/10 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-100";
      case "In Progress": return "bg-blue-500/10 dark:bg-blue-500/30 text-blue-700 dark:text-blue-100";
      case "Not Started": return "bg-slate-500/10 dark:bg-slate-500/30 text-slate-700 dark:text-slate-200";
      default: return "bg-slate-500/10 dark:bg-slate-500/30 text-slate-700 dark:text-slate-200";
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
        try {
          await axios.post('/api/progress/completed-tasks');

          // Check if task was completed before 9 AM for Early Bird achievement
          const now = new Date();
          if (now.getHours() < 9) {
            await axios.post('/api/progress/early-bird-task');
          }
        } catch (err) {
          console.error('Error awarding points/achievements:', err);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleLocalDelete = (e) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(_id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-panel p-6 group hover:bg-slate-50/90 dark:hover:bg-slate-800/80 transition-all duration-300 border border-white/5 shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="pt-1">
            <input
              type="checkbox"
              id={`task-checkbox-${_id}`}
              name={`task-checkbox-${_id}`}
              className="h-6 w-6 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer transition-all"
              checked={status === "Completed"}
              onChange={() => handleStatusChange(status === "Completed" ? "Not Started" : "Completed")}
            />
          </div>
          <div className="ml-5">
            <h3 className={`text-xl font-bold transition-colors ${status === "Completed" ? "line-through text-slate-400 dark:text-slate-500 decoration-2" : "text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300"}`}>
              {subject}
            </h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border tracking-wide uppercase shadow-sm ${getPriorityColor(priority)}`}>
            {priority}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">
            <span className="mr-1.5">📅</span>
            {formatDate(targetDateTime)}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex justify-between items-center">
        <span className={`text-xs px-3 py-1 bg-opacity-20 rounded-full font-bold tracking-wide uppercase ${getStatusColor(status)}`}>
          {status}
        </span>
        <div className="flex space-x-2">
          <Link
            to={`/edit-task/${_id}`}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors flex items-center group/edit px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <span className="mr-1.5 transform group-hover/edit:rotate-12 transition-transform">✏️</span> Edit
          </Link>
          <button
            onClick={handleLocalDelete}
            className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors flex items-center group/delete px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="mr-1.5 transform group-hover/delete:scale-110 transition-transform">🗑️</span> Delete
          </button>
          <Link
            to={`/tasks`}
            className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center group/view px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span className="mr-1.5 transform group-hover/view:scale-110 transition-transform">👁️</span> View All
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardTaskCard;
