const Progress = require('../models/Progress');

// Get user's progress stats
exports.getProgressStats = async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      // Create new progress document if it doesn't exist
      progress = await Progress.create({
        userId: req.user._id,
        achievements: [
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
        ]
      });
    }

    // Check and update achievements
    await progress.checkAchievements();
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ message: 'Error fetching progress stats' });
  }
};

// Update study time
exports.updateStudyTime = async (req, res) => {
  try {
    const { minutes } = req.body;
    
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { totalStudyTime: minutes } },
      { new: true }
    );

    // Check achievements after update
    await progress.checkAchievements();

    res.json(progress);
  } catch (error) {
    console.error('Error updating study time:', error);
    res.status(500).json({ message: 'Error updating study time' });
  }
};

// Update completed tasks
exports.updateCompletedTasks = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { completedTasks: 1 } },
      { new: true }
    );

    // Check achievements after update
    await progress.checkAchievements();

    res.json(progress);
  } catch (error) {
    console.error('Error updating completed tasks:', error);
    res.status(500).json({ message: 'Error updating completed tasks' });
  }
};

// Update early bird task
exports.updateEarlyBirdTask = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { earlyBirdTasks: 1 } },
      { new: true }
    );

    // Check achievements after update
    await progress.checkAchievements();

    res.json(progress);
  } catch (error) {
    console.error('Error updating early bird task:', error);
    res.status(500).json({ message: 'Error updating early bird task' });
  }
};

// Update completed Pomodoros
exports.updateCompletedPomodoros = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { completedPomodoros: 1 } },
      { new: true }
    );

    // Check achievements after update
    await progress.checkAchievements();

    res.json(progress);
  } catch (error) {
    console.error('Error updating completed Pomodoros:', error);
    res.status(500).json({ message: 'Error updating completed Pomodoros' });
  }
};

// Update flashcards reviewed
exports.updateFlashcardsReviewed = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { flashcardsReviewed: 1 } },
      { new: true }
    );

    // Check achievements after update
    await progress.checkAchievements();

    res.json(progress);
  } catch (error) {
    console.error('Error updating flashcards reviewed:', error);
    res.status(500).json({ message: 'Error updating flashcards reviewed' });
  }
};

// Update streak
exports.updateStreak = async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id });
    const today = new Date();
    const lastActive = new Date(progress.lastActiveDate);
    
    // Check if last active was yesterday
    const isConsecutiveDay = 
      today.getDate() - lastActive.getDate() === 1 &&
      today.getMonth() === lastActive.getMonth() &&
      today.getFullYear() === lastActive.getFullYear();

    // Check if already active today (same day)
    const isSameDay = 
      today.getDate() === lastActive.getDate() &&
      today.getMonth() === lastActive.getMonth() &&
      today.getFullYear() === lastActive.getFullYear();

    if (isConsecutiveDay) {
      // Increment streak if consecutive day
      progress.streakDays += 1;
      
      // Update best streak if current streak is better
      if (progress.streakDays > progress.bestStreak) {
        progress.bestStreak = progress.streakDays;
      }
    } else if (!isSameDay) {
      // Reset streak if more than one day has passed, but don't reset if already active today
      progress.streakDays = 1;
    }

    progress.lastActiveDate = today;
    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ message: 'Error updating streak' });
  }
}; 