import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import DashboardTaskCard from "./DashboardTaskCard";

const DashboardTaskSection = ({ title, tasks = [], icon, onStatusChange, onDelete, emptyMessage, color = "blue" }) => {
  const { darkMode } = useContext(ThemeContext);

  // Ensure tasks is always an array
  const safeTaskList = Array.isArray(tasks) ? tasks : [];

  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
    red: "from-red-500/20 to-red-600/5 border-red-500/30",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    yellow: "from-amber-500/20 to-amber-600/5 border-amber-500/30"
  };

  const textClasses = {
    blue: "text-blue-800 dark:text-white dark:font-extrabold",
    red: "text-red-800 dark:text-white dark:font-extrabold",
    green: "text-emerald-800 dark:text-white dark:font-extrabold",
    yellow: "text-amber-800 dark:text-white dark:font-extrabold"
  };

  return (
    <div className="glass-card p-6 mb-8">
      <div className={`flex items-center mb-6 px-4 py-3 rounded-xl bg-gradient-to-r border ${colorClasses[color] || colorClasses.blue}`}>
        <span className={`text-2xl mr-3 ${textClasses[color] || textClasses.blue}`}>{icon}</span>
        <h2 className={`text-lg font-bold tracking-wide ${textClasses[color] || textClasses.blue}`}>{title}</h2>
        <span className="ml-auto bg-white/20 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-slate-800 dark:text-white">
          {safeTaskList.length}
        </span>
      </div>

      {safeTaskList.length > 0 ? (
        <div className="space-y-4">
          {safeTaskList.map((task) => (
            task && task._id ? (
              <DashboardTaskCard 
                key={task._id} 
                task={task} 
                onStatusChange={onStatusChange} 
                onDelete={onDelete}
              />
            ) : null
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center border-dashed border-2 border-slate-300 dark:border-slate-700/50">
          <p className="text-slate-500 dark:text-slate-200 italic">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardTaskSection;
