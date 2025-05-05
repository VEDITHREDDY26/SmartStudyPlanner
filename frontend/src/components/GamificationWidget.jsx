import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

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

      const response = await axios.get('http://localhost:5000/api/gamify/stats', {
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

      const response = await axios.get('http://localhost:5000/api/gamify/leaderboard', {
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
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'} rounded-lg shadow-md p-4 border`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Your Progress
        </h2>
        <div className="flex items-center">
          <span className={`font-medium text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
            Level {profile.level}
          </span>
        </div>
      </div>
      
      {/* Level Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Points: {profile.points}</span>
          <span>Next Level: {profile.level * 100}</span>
        </div>
        <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="text-sm font-medium mb-1">Current Streak</div>
          <div className="text-xl font-bold flex items-center">
            {profile.streakDays || 0} <span className="ml-1">🔥</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="text-sm font-medium mb-1">Achievements</div>
          <div className="text-xl font-bold">{profile.achievements ? profile.achievements.length : 0}</div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="text-sm font-medium mb-1">Best Streak</div>
          <div className="text-xl font-bold">{profile.longestStreak || 0}</div>
        </div>
      </div>
      
      {/* Recent Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div className="mb-4">
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.achievements.slice(0, 5).map((achievement, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} flex items-center`}
                title={achievement.description}
              >
                <span className="text-xl mr-2">{achievement.icon}</span>
                <span className="text-xs">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Leaderboard Toggle */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className={`w-full py-2 rounded-lg ${
          darkMode
            ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        } text-sm flex justify-center items-center transition-colors`}
      >
        {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'} 
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ml-1 transform transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Leaderboard
          </h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((leaderUser, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded ${
                    leaderUser.userId?._id === profile.userId
                      ? darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="font-bold mr-2">#{index + 1}</span>
                    <span>{getDisplayName(leaderUser.userId)}</span>
                    {leaderUser.userId?._id === profile.userId && (
                      <span className="ml-2 text-xs italic">(You)</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">{leaderUser.points}</span>
                    <span className="ml-1 text-xs">pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">No leaderboard data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
