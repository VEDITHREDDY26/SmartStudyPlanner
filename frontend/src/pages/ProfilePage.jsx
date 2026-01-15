import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
    fetchGamificationStats();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      setFetchError(false);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/user-profile/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('User profile response:', response.data);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setFetchError(true);
      // Don't show toast here as it might be annoying
    }
  };
  
  const fetchGamificationStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/gamify/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      // Don't show toast here as it might be annoying
    } finally {
      setLoading(false);
    }
  };

  // Generate display name based on available user data
  const getDisplayName = () => {
    // First check if we have profile data from backend
    if (userProfile?.displayName) {
      return userProfile.displayName;
    }
    
    // Check if we have user data from API
    if (userProfile?.user?.name) {
      return userProfile.user.name;
    }
    
    // Fall back to user data from auth context
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.name) {
      return user.name;
    } else if (user?.email) {
      // Use part before @ in email if no name is available
      return user.email.split('@')[0];
    } else {
      return 'User';
    }
  };

  // Get user email from all available sources
  const getUserEmail = () => {
    if (userProfile?.user?.email) {
      return userProfile.user.email;
    }
    
    if (user?.email) {
      return user.email;
    }
    
    return 'Not available';
  };
  
  // Get account creation date from all available sources
  const getAccountCreatedDate = () => {
    if (userProfile?.user?.createdAt) {
      return new Date(userProfile.user.createdAt).toLocaleDateString();
    }
    
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString();
    }
    
    if (userProfile?.createdAt) {
      return new Date(userProfile.createdAt).toLocaleDateString();
    }
    
    return 'Not available';
  };

  // Generate initials for avatar
  const getInitials = () => {
    // First check if we have profile data from backend
    if (userProfile?.displayName) {
      if (userProfile.displayName.includes(' ')) {
        const nameParts = userProfile.displayName.split(' ');
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return userProfile.displayName[0].toUpperCase();
    }
    
    // Check if we have user data from API
    if (userProfile?.user?.name) {
      if (userProfile.user.name.includes(' ')) {
        const nameParts = userProfile.user.name.split(' ');
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return userProfile.user.name[0].toUpperCase();
    }
    
    // Fall back to user data from auth context
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.name && user.name.includes(' ')) {
      const nameParts = user.name.split(' ');
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (user?.name) {
      return user.name[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    } else {
      return 'U';
    }
  };

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen py-8 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}
    >
      <ToastContainer />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            View and manage your account information
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className={`rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"} p-6 mb-8`}>
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Name
                  </label>
                  <div className={`w-full p-2 border rounded-lg ${darkMode 
                    ? "bg-gray-700 border-gray-600" 
                    : "bg-gray-100 border-gray-300"}`}
                  >
                    {getDisplayName()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <div className={`w-full p-2 border rounded-lg ${darkMode 
                    ? "bg-gray-700 border-gray-600" 
                    : "bg-gray-100 border-gray-300"}`}
                  >
                    {getUserEmail()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Created
                  </label>
                  <div className={`w-full p-2 border rounded-lg ${darkMode 
                    ? "bg-gray-700 border-gray-600" 
                    : "bg-gray-100 border-gray-300"}`}
                  >
                    {getAccountCreatedDate()}
                  </div>
                </div>
              </div>
              
              {fetchError && (
                <div className={`p-3 mt-4 rounded-lg ${darkMode ? "bg-red-900/30 text-red-200" : "bg-red-100 text-red-800"}`}>
                  <p className="text-sm">
                    <strong>Note:</strong> There was an issue loading your profile from the server. 
                    Some information might be using local data only.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* User Stats */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"} p-6 mb-8`}>
              <h2 className="text-xl font-semibold mb-4">Study Stats</h2>
              
              {stats ? (
                <div>
                  {/* Profile Summary */}
                  <div className="text-center mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold ${darkMode ? "bg-indigo-900" : "bg-indigo-100"}`}
                    >
                      {getInitials()}
                    </motion.div>
                    <h3 className="text-lg font-medium">
                      {getDisplayName()}
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Member since {getAccountCreatedDate()}
                    </p>
                  </div>

                  {/* Gamification Stats */}
                  <div className="space-y-3">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg ${darkMode ? "bg-indigo-900/30" : "bg-indigo-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Level</span>
                        <span className={`font-bold ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}>{stats.level}</span>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Points</span>
                        <span className={`font-bold ${darkMode ? "text-blue-300" : "text-blue-700"}`}>{stats.points}</span>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Current Streak</span>
                        <span className={`font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}>{stats.streakDays || 0} days</span>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg ${darkMode ? "bg-purple-900/30" : "bg-purple-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Achievements</span>
                        <span className={`font-bold ${darkMode ? "text-purple-300" : "text-purple-700"}`}>{stats.achievements ? stats.achievements.length : 0}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No stats available yet</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Achievements Section */}
        {stats && stats.achievements && stats.achievements.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"} p-6 mt-6`}
          >
            <h2 className="text-xl font-semibold mb-6">Your Achievements</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.achievements.map((achievement, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-4 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{achievement.icon}</span>
                    <h3 className="font-semibold">{achievement.name}</h3>
                  </div>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{achievement.description}</p>
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Earned: {new Date(achievement.dateEarned).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;
