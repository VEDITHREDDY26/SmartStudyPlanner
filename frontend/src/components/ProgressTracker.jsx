import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ProgressTracker = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    completedTasks: 0,
    completedPomodoros: 0,
    flashcardsReviewed: 0,
    streakDays: 0,
    bestStreak: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchProgressStats();
    fetchLeaderboard();
  }, []);

  const fetchProgressStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/progress/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      setLoading(false);
    }
  };

  // Fetch mock leaderboard data (can be replaced with real API call later)
  const fetchLeaderboard = async () => {
    // This is currently using mock data - in a real app, you'd fetch from your API
    // You can replace this with an actual API call once implemented on the backend
    const mockLeaderboard = [
      { id: 1, name: "Alex", streakDays: 15, points: 250 },
      { id: 2, name: "Sam", streakDays: 12, points: 220 },
      { id: 3, name: "Jordan", streakDays: 10, points: 200 },
      { id: 4, name: "Taylor", streakDays: 8, points: 175 },
      { id: 5, name: "Casey", streakDays: 6, points: 150 },
    ];
    
    // If the current user has an active streak, add them to the leaderboard
    if (user && stats.streakDays > 0) {
      const userExists = mockLeaderboard.some(item => item.name === user.name);
      if (!userExists) {
        mockLeaderboard.push({
          id: 6,
          name: user.name,
          streakDays: stats.streakDays,
          points: stats.streakDays * 20 + stats.completedTasks * 5
        });
      }
    }
    
    // Sort by points in descending order
    mockLeaderboard.sort((a, b) => b.points - a.points);
    
    setLeaderboard(mockLeaderboard);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateAchievementProgress = (achievement) => {
    switch (achievement.id) {
      case 1: // Early Bird
        return Math.min(100, (stats.earlyBirdTasks / 5) * 100);
      case 2: // Focus Master
        return Math.min(100, (stats.completedPomodoros / 10) * 100);
      case 3: // Flashcard Pro
        return Math.min(100, (stats.flashcardsReviewed / 50) * 100);
      case 4: // Task Warrior
        return Math.min(100, (stats.completedTasks / 20) * 100);
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Progress Tracker</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Study Time</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{formatTime(stats.totalStudyTime)}</p>
              </div>
              <span className="text-2xl sm:text-3xl">⏱️</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed Tasks</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.completedTasks}</p>
              </div>
              <span className="text-2xl sm:text-3xl">✅</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pomodoro Sessions</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.completedPomodoros}</p>
              </div>
              <span className="text-2xl sm:text-3xl">🍅</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Streak</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.streakDays} days</p>
              </div>
              <span className="text-2xl sm:text-3xl">🔥</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Streak</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.bestStreak} days</p>
              </div>
              <span className="text-2xl sm:text-3xl">🏆</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Flashcards</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.flashcardsReviewed}</p>
              </div>
              <span className="text-2xl sm:text-3xl">📚</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Achievements Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 md:p-6`}>
            <h2 className="text-xl font-bold mb-4 md:mb-6">Achievements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {stats.achievements && stats.achievements.map((achievement) => {
                const progress = calculateAchievementProgress(achievement);
                return (
                  <div 
                    key={achievement.id}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 md:p-4`}
                  >
                    <div className="flex items-center mb-3">
                      <span className="text-xl md:text-2xl mr-3">{achievement.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{achievement.title}</h3>
                        <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${achievement.completed ? 'bg-green-500' : 'bg-blue-600'} h-2.5 rounded-full`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs md:text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {progress}% Complete
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 md:p-6`}>
            <h2 className="text-xl font-bold mb-4 md:mb-6">Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Streak</th>
                    <th className="px-4 py-2 text-left">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.id}
                      className={`
                        ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} 
                        ${user && entry.name === user.name ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') : ''}
                      `}
                    >
                      <td className="px-4 py-3 flex items-center">
                        {index === 0 && <span className="mr-1 text-lg">🥇</span>}
                        {index === 1 && <span className="mr-1 text-lg">🥈</span>}
                        {index === 2 && <span className="mr-1 text-lg">🥉</span>}
                        {index > 2 && <span className="font-medium">{index + 1}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {user && entry.name === user.name ? (
                          <span className="font-semibold">{entry.name} (You)</span>
                        ) : (
                          entry.name
                        )}
                      </td>
                      <td className="px-4 py-3">{entry.streakDays} days</td>
                      <td className="px-4 py-3">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Points are calculated from streaks, completed tasks, and achievements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;