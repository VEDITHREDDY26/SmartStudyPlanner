const mongoose = require('mongoose');
const User = require('../models/User');
const Gamification = require('../models/gamification');
const Task = require('../models/Task');

// Initialize gamification for a new user
exports.initializeGamification = async (userId) => {
  try {
    const existingProfile = await Gamification.findOne({ userId });
    
    if (!existingProfile) {
      const gamificationProfile = new Gamification({
        userId,
        points: 0,
        level: 1,
        streakDays: 0,
        achievements: [],
        badges: [],
        dailyCompletionHistory: []
      });
      
      await gamificationProfile.save();
      return gamificationProfile;
    }
    
    return existingProfile;
  } catch (error) {
    console.error('Error initializing gamification:', error);
    throw error;
  }
};

// Award points for completing a task
exports.awardTaskPoints = async (req, res) => {
  try {
    const { userId, taskId } = req.body;
    
    if (!userId || !taskId) {
      return res.status(400).json({ message: 'User ID and Task ID are required' });
    }
    
    // Get task details to determine points based on priority
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Points based on priority
    let pointsToAward = 10; // Default points
    if (task.priority === 'High') {
      pointsToAward = 30;
    } else if (task.priority === 'Medium') {
      pointsToAward = 20;
    }
    
    // Get or create user's gamification profile
    let profile = await Gamification.findOne({ userId });
    if (!profile) {
      profile = await this.initializeGamification(userId);
    }
    
    // Update points
    profile.points += pointsToAward;
    
    // Check and update level (simple level system: level = points / 100 + 1)
    const newLevel = Math.floor(profile.points / 100) + 1;
    const leveledUp = newLevel > profile.level;
    profile.level = newLevel;
    
    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = profile.lastActivity ? new Date(profile.lastActivity) : null;
    let lastActivityDate = null;
    if (lastActivity) {
      lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);
    }
    
    // Check if this is a new day compared to the last activity
    if (!lastActivityDate || today.getTime() !== lastActivityDate.getTime()) {
      // Check if this is a consecutive day (yesterday)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
        // It's a consecutive day, increment streak
        profile.streakDays += 1;
        
        // Update longest streak if current streak is longer
        if (profile.streakDays > profile.longestStreak) {
          profile.longestStreak = profile.streakDays;
        }
      } else if (!lastActivityDate || lastActivityDate.getTime() !== today.getTime()) {
        // It's not consecutive, reset streak to 1 (today)
        profile.streakDays = 1;
      }
    }
    
    // Add to daily completion history
    const todayRecord = profile.dailyCompletionHistory.find(
      record => new Date(record.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (todayRecord) {
      todayRecord.tasksCompleted += 1;
    } else {
      profile.dailyCompletionHistory.push({
        date: today,
        tasksCompleted: 1
      });
    }
    
    // Keep only last 30 days in history
    profile.dailyCompletionHistory = profile.dailyCompletionHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);
    
    profile.lastActivity = new Date();
    await profile.save();
    
    // Check for achievements
    let newAchievements = [];
    
    // Check for task completion achievements
    const totalTasksCompleted = profile.dailyCompletionHistory.reduce(
      (total, day) => total + day.tasksCompleted, 0
    );
    
    const possibleAchievements = [
      { threshold: 1, name: 'First Step', description: 'Complete your first task', icon: '🌱' },
      { threshold: 10, name: 'Getting Started', description: 'Complete 10 tasks', icon: '🌿' },
      { threshold: 25, name: 'On a Roll', description: 'Complete 25 tasks', icon: '🌳' },
      { threshold: 50, name: 'Task Master', description: 'Complete 50 tasks', icon: '🏆' },
      { threshold: 100, name: 'Productivity Champion', description: 'Complete 100 tasks', icon: '👑' }
    ];
    
    possibleAchievements.forEach(achievement => {
      if (totalTasksCompleted >= achievement.threshold && 
          !profile.achievements.some(a => a.name === achievement.name)) {
        newAchievements.push({
          name: achievement.name,
          description: achievement.description,
          dateEarned: new Date(),
          icon: achievement.icon
        });
      }
    });
    
    // Check for streak achievements
    const streakAchievements = [
      { threshold: 3, name: 'Three-Day Streak', description: 'Complete tasks for 3 days in a row', icon: '🔥' },
      { threshold: 7, name: 'Week Warrior', description: 'Complete tasks for 7 days in a row', icon: '🗓️' },
      { threshold: 14, name: 'Dedicated Learner', description: 'Complete tasks for 14 days in a row', icon: '📚' },
      { threshold: 30, name: 'Monthly Master', description: 'Complete tasks for 30 days in a row', icon: '🌟' }
    ];
    
    streakAchievements.forEach(achievement => {
      if (profile.streakDays >= achievement.threshold && 
          !profile.achievements.some(a => a.name === achievement.name)) {
        newAchievements.push({
          name: achievement.name,
          description: achievement.description,
          dateEarned: new Date(),
          icon: achievement.icon
        });
      }
    });
    
    // Add new achievements to profile
    if (newAchievements.length > 0) {
      profile.achievements = [...profile.achievements, ...newAchievements];
      await profile.save();
    }
    
    return res.status(200).json({
      success: true,
      points: pointsToAward,
      totalPoints: profile.points,
      level: profile.level,
      leveledUp,
      streak: profile.streakDays,
      newAchievements
    });
    
  } catch (error) {
    console.error('Error awarding points:', error);
    return res.status(500).json({ 
      message: 'Error processing gamification rewards', 
      error: error.message 
    });
  }
};

// Get user gamification stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    let profile = await Gamification.findOne({ userId });
    if (!profile) {
      profile = await this.initializeGamification(userId);
    }
    
    return res.status(200).json({
      points: profile.points,
      level: profile.level,
      streakDays: profile.streakDays,
      longestStreak: profile.longestStreak,
      achievements: profile.achievements,
      badges: profile.badges,
      dailyCompletionHistory: profile.dailyCompletionHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30) // Last 30 days
    });
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({ 
      message: 'Error fetching gamification stats', 
      error: error.message 
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Gamification.find()
      .sort({ points: -1, level: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .select('userId points level streakDays achievements');
    
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return res.status(500).json({ 
      message: 'Error fetching leaderboard', 
      error: error.message 
    });
  }
};
