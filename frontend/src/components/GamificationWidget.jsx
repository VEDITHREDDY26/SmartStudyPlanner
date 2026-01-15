import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

const GamificationWidget = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchUserStats();
    fetchLeaderboard();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // Don't show a toast here as it's distracting
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/gamify/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      // Don't show a toast here as it's distracting
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/gamify/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Don't show error toast here
    }
  };

  // Get display name from user data
  const getDisplayName = (userData) => {
    if (!userData) return 'User';
    
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData.name) {
      return userData.name;
    } else if (userData.email) {
      // Use part before @ in email if no name is available
      return userData.email.split('@')[0];
    } else {
      return 'User';
    }
  };

  // Calculate progress to next level
  const calculateProgress = () => {
    if (!profile) return 0;
    
    // Simple level progress calculation
    const pointsForCurrentLevel = (profile.level - 1) * 100;
    const pointsForNextLevel = profile.level * 100;
    const pointsInCurrentLevel = profile.points - pointsForCurrentLevel;
    const pointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
    
    return Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100));
  };

  if (loading) {
    return (
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md animate-pulse`}>
        <div className="h-4 w-1/2 bg-gray-300 rounded mb-3"></div>
        <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>
        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`p-4 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-lg shadow-md`}>
        <p>Your gamification data will appear here once you complete tasks.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border border-white/20 shadow-xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
          <span className="mr-2">🏆</span> Your Progress
        </h2>
        <div className="flex items-center">
          <span className="font-bold text-xs px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-sm border border-white/20">
            Level {profile.level}
          </span>
        </div>
      </div>
      
      {/* Level Progress Bar */}
      <div className="mb-6 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/10 dark:border-white/5">
        <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
          <span>{profile.points} pts</span>
          <span>Next: {profile.level * 100} pts</span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{profile.streakDays || 0} 🔥</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Day Streak</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{profile.achievements ? profile.achievements.length : 0} 🏅</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Badges</div>
        </div>
      </div>
      
      {/* Recent Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Recent Unlocks
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.achievements.slice(0, 5).map((achievement, index) => (
              <div 
                key={index}
                className="px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-700/60 border border-slate-200 dark:border-white/10 flex items-center shadow-sm"
                title={achievement.description}
              >
                <span className="text-lg mr-2">{achievement.icon}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Leaderboard Toggle */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="w-full py-2.5 rounded-xl glass-button-secondary text-sm font-bold flex justify-center items-center shadow-sm hover:shadow transition-all"
      >
        {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'} 
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ml-2 transform transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/10 max-h-60 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-200 uppercase tracking-wider text-center">
            Top Learners
          </h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((leaderUser, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    leaderUser.userId?._id === profile.userId
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white dark:bg-slate-700/30 border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`font-bold mr-3 w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-700' : 
                      'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`text-sm font-semibold ${leaderUser.userId?._id === profile.userId ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {getDisplayName(leaderUser.userId)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {leaderUser.points} pts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
