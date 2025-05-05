const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalStudyTime: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  completedPomodoros: {
    type: Number,
    default: 0
  },
  flashcardsReviewed: {
    type: Number,
    default: 0
  },
  earlyBirdTasks: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    id: Number,
    title: String,
    description: String,
    icon: String,
    completed: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    },
    completedAt: Date,
    requirements: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Add a method to check and update achievements
progressSchema.methods.checkAchievements = async function() {
  const achievements = [
    {
      id: 1,
      title: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      icon: '🌅',
      requirements: 5
    },
    {
      id: 2,
      title: 'Focus Master',
      description: 'Complete 10 Pomodoro sessions',
      icon: '🎯',
      requirements: 10
    },
    {
      id: 3,
      title: 'Flashcard Pro',
      description: 'Review 50 flashcards',
      icon: '📚',
      requirements: 50
    },
    {
      id: 4,
      title: 'Task Warrior',
      description: 'Complete 20 tasks',
      icon: '⚔️',
      requirements: 20
    }
  ];

  // Initialize achievements if they don't exist
  if (!this.achievements || this.achievements.length === 0) {
    this.achievements = achievements;
  }

  // Update achievement progress
  for (let achievement of this.achievements) {
    let progress = 0;
    switch (achievement.id) {
      case 1: // Early Bird
        progress = Math.min(100, (this.earlyBirdTasks / achievement.requirements) * 100);
        break;
      case 2: // Focus Master
        progress = Math.min(100, (this.completedPomodoros / achievement.requirements) * 100);
        break;
      case 3: // Flashcard Pro
        progress = Math.min(100, (this.flashcardsReviewed / achievement.requirements) * 100);
        break;
      case 4: // Task Warrior
        progress = Math.min(100, (this.completedTasks / achievement.requirements) * 100);
        break;
    }

    achievement.progress = progress;
    
    // Check if achievement is completed
    if (progress >= 100 && !achievement.completed) {
      achievement.completed = true;
      achievement.completedAt = new Date();
    }
  }

  await this.save();
};

module.exports = mongoose.model('Progress', progressSchema);