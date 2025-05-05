const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streakDays: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    name: String,
    description: String,
    dateEarned: Date,
    icon: String
  }],
  // Badges users have earned
  badges: [{
    name: String,
    description: String,
    dateEarned: Date,
    icon: String
  }],
  // Daily completed tasks history for streak calculation
  dailyCompletionHistory: [{
    date: Date,
    tasksCompleted: Number
  }]
}, { timestamps: true });

const Gamification = mongoose.model('Gamification', gamificationSchema);

module.exports = Gamification;
