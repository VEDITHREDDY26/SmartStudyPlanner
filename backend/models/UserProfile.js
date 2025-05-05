const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  dateEarned: {
    type: Date,
    default: Date.now
  }
});

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    default: 'Student'
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  achievements: [achievementSchema],
  // Stats for gamification
  stats: {
    pomodoroSessionsCompleted: {
      type: Number,
      default: 0
    },
    flashcardsReviewed: {
      type: Number,
      default: 0
    },
    totalStudyMinutes: {
      type: Number,
      default: 0
    },
    tasksCompletedOnTime: {
      type: Number,
      default: 0
    },
    tasksCompletedLate: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Calculate level and experience requirements
userProfileSchema.methods.calculateLevel = function() {
  // Simple level calculation: level = 1 + floor(sqrt(experience / 100))
  // This makes each level require progressively more experience
  const newLevel = Math.floor(1 + Math.sqrt(this.experience / 100));
  
  // If leveled up, update the level
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  
  return this.level;
};

// Calculate experience needed for next level
userProfileSchema.methods.experienceForNextLevel = function() {
  return Math.pow(this.level, 2) * 100;
};

// Add experience points
userProfileSchema.methods.addExperience = function(points) {
  this.experience += points;
  this.points += points;
  this.calculateLevel();
  return this;
};

// Update streak
userProfileSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActive = this.lastActive;
  
  // Calculate days between last activity and now
  const daysBetween = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysBetween <= 1) {
    // User was active yesterday or today, increment streak
    this.streak += 1;
    
    // Update longest streak if current streak is longer
    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak;
    }
  } else if (daysBetween > 1) {
    // User missed a day, reset streak
    this.streak = 1;
  }
  
  this.lastActive = now;
  return this;
};

// Add an achievement
userProfileSchema.methods.addAchievement = function(achievement) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(a => a.name === achievement.name);
  
  if (!existingAchievement) {
    this.achievements.push(achievement);
    // Award points for achievement
    this.addExperience(50);
  }
  
  return this;
};

// Check and award achievements based on stats
userProfileSchema.methods.checkAchievements = function() {
  const { stats } = this;
  
  // Achievement definitions
  const possibleAchievements = [
    {
      name: 'First Steps',
      description: 'Complete your first task',
      icon: '🏅',
      condition: () => this.tasksCompleted >= 1
    },
    {
      name: 'Productive Scholar',
      description: 'Complete 10 tasks',
      icon: '🎓',
      condition: () => this.tasksCompleted >= 10
    },
    {
      name: 'Task Master',
      description: 'Complete 50 tasks',
      icon: '⭐',
      condition: () => this.tasksCompleted >= 50
    },
    {
      name: 'Focus Champion',
      description: 'Complete 10 Pomodoro sessions',
      icon: '⏱️',
      condition: () => stats.pomodoroSessionsCompleted >= 10
    },
    {
      name: 'Memory Wizard',
      description: 'Review 50 flashcards',
      icon: '🧠',
      condition: () => stats.flashcardsReviewed >= 50
    },
    {
      name: 'Study Marathon',
      description: 'Accumulate 500 minutes of study time',
      icon: '⌛',
      condition: () => stats.totalStudyMinutes >= 500
    },
    {
      name: 'Consistency King',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      condition: () => this.streak >= 7
    },
    {
      name: 'Habit Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      condition: () => this.streak >= 30
    }
  ];
  
  // Check each achievement and add if conditions are met
  possibleAchievements.forEach(achievement => {
    if (achievement.condition()) {
      this.addAchievement({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon
      });
    }
  });
  
  return this;
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
