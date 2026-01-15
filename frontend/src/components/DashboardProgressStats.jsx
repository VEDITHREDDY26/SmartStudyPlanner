import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

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

  const statItems = [
    { label: "Total Tasks", value: totalTasks, color: "text-slate-800 dark:text-white" },
    { label: "Completed", value: completedTasks, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "In Progress", value: inProgressTasks, color: "text-blue-600 dark:text-blue-400" },
    { label: "Not Started", value: notStartedTasks, color: "text-slate-500 dark:text-slate-300" },
    { label: "Current Streak", value: streakDays, icon: "🔥", color: "text-orange-600 dark:text-orange-400" },
    { label: "Best Streak", value: bestStreak, icon: "🏆", color: "text-yellow-600 dark:text-yellow-400" },
  ];

  return (
    <div className="glass-card p-6 mb-8 border border-white/20 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
        <span className="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">📊</span> Progress Overview
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-panel p-4 flex flex-col items-center justify-center text-center border border-white/10 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{item.label}</p>
            <div className="flex items-center justify-center">
              <p className={`text-3xl font-extrabold ${item.color} drop-shadow-sm`}>{item.value}</p>
              {item.icon && <span className="ml-2 text-xl filter drop-shadow-md">{item.icon}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Completion Rate</span>
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
      </div>

      <div className="w-full h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-200 dark:border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        ></motion.div>
      </div>
    </div>
  );
};

export default DashboardProgressStats;
