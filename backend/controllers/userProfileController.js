const UserProfile = require('../models/UserProfile');
const Task = require('../models/Task');
const User = require('../models/User');

// Get or create user profile
const getOrCreateProfile = async (req, res) => {
  try {
    // Use the _id provided by the auth middleware instead of id
    const userId = req.user?._id || req.body.userId || 'defaultuser123';
    
    // Try to find existing profile
    let userProfile = await UserProfile.findOne({ userId: userId.toString() });
    
    // Get user data for the profile
    let userData = null;
    if (req.user && req.user._id) {
      userData = await User.findById(req.user._id).select('name email createdAt');
    }
    
    // If profile doesn't exist, create a new one
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: userId.toString(),
        displayName: userData?.name || req.user?.name || 'Student'
      });
      await userProfile.save();
    }
    
    // Update streak if the user is active today
    userProfile.updateStreak();
    await userProfile.save();
    
    // Combine user data with profile data
    const responseData = {
      ...userProfile.toObject(),
      user: userData
    };
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    res.status(500).json({ message: 'Error getting user profile', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Use the _id provided by the auth middleware instead of id
    const userId = req.user?._id || req.body.userId || 'defaultuser123';
    const updateData = req.body;
    
    // Remove fields that shouldn't be directly updated by clients
    const protectedFields = ['points', 'level', 'experience', 'streak', 'achievements'];
    protectedFields.forEach(field => delete updateData[field]);
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: userId.toString() },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

// Award points for completing tasks
const awardTaskPoints = async (req, res) => {
  try {
    // Use the _id provided by the auth middleware instead of id
    const userId = req.user?._id || req.body.userId || 'defaultuser123';
    const { taskId } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }
    
    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get user profile
    let profile = await UserProfile.findOne({ userId: userId.toString() });
    if (!profile) {
      profile = new UserProfile({ userId: userId.toString() });
    }
    
    // Award points based on task priority
    let pointsAwarded = 10; // Base points
    
    if (task.priority === 'High') {
      pointsAwarded = 30;
    } else if (task.priority === 'Medium') {
      pointsAwarded = 20;
    }
    
    // Award extra points if the task is completed on time
    const now = new Date();
    if (task.targetDateTime && new Date(task.targetDateTime) >= now) {
      pointsAwarded += 15;
      profile.stats.tasksCompletedOnTime += 1;
    } else if (task.targetDateTime) {
      profile.stats.tasksCompletedLate += 1;
    }
    
    // Award double points if the task is a review task
    if (task.isReviewTask) {
      pointsAwarded *= 2;
    }
    
    // Update profile stats
    profile.tasksCompleted += 1;
    profile.addExperience(pointsAwarded);
    
    // Check for new achievements
    profile.checkAchievements();
    
    await profile.save();
    
    res.status(200).json({
      message: 'Points awarded successfully',
      pointsAwarded,
      newLevel: profile.level,
      profile
    });
  } catch (error) {
    console.error('Error in awardTaskPoints:', error);
    res.status(500).json({ message: 'Error awarding points', error: error.message });
  }
};

// Award points for completing Pomodoro sessions
const awardPomodoroPoints = async (req, res) => {
  try {
    // Use the _id provided by the auth middleware instead of id
    const userId = req.user?._id || req.body.userId || 'defaultuser123';
    const { sessionType, durationMinutes } = req.body;
    
    if (!sessionType || !durationMinutes) {
      return res.status(400).json({ message: 'Session type and duration are required' });
    }
    
    // Get user profile
    let profile = await UserProfile.findOne({ userId: userId.toString() });
    if (!profile) {
      profile = new UserProfile({ userId: userId.toString() });
    }
    
    // Update stats
    if (sessionType === 'work') {
      profile.stats.pomodoroSessionsCompleted += 1;
      profile.stats.totalStudyMinutes += parseInt(durationMinutes);
      
      // Award points (5 points per 5 minutes of work)
      const pointsAwarded = Math.floor(durationMinutes / 5) * 5;
      profile.addExperience(pointsAwarded);
    }
    
    // Check for new achievements
    profile.checkAchievements();
    
    await profile.save();
    
    res.status(200).json({
      message: 'Pomodoro session recorded',
      profile
    });
  } catch (error) {
    console.error('Error in awardPomodoroPoints:', error);
    res.status(500).json({ message: 'Error recording Pomodoro session', error: error.message });
  }
};

// Award points for reviewing flashcards
const awardFlashcardPoints = async (req, res) => {
  try {
    // Use the _id provided by the auth middleware instead of id
    const userId = req.user?._id || req.body.userId || 'defaultuser123';
    const { flashcardCount } = req.body;
    
    if (!flashcardCount) {
      return res.status(400).json({ message: 'Flashcard count is required' });
    }
    
    // Get user profile
    let profile = await UserProfile.findOne({ userId: userId.toString() });
    if (!profile) {
      profile = new UserProfile({ userId: userId.toString() });
    }
    
    // Update stats
    profile.stats.flashcardsReviewed += parseInt(flashcardCount);
    
    // Award points (2 points per flashcard reviewed)
    const pointsAwarded = flashcardCount * 2;
    profile.addExperience(pointsAwarded);
    
    // Check for new achievements
    profile.checkAchievements();
    
    await profile.save();
    
    res.status(200).json({
      message: 'Flashcard review recorded',
      pointsAwarded,
      profile
    });
  } catch (error) {
    console.error('Error in awardFlashcardPoints:', error);
    res.status(500).json({ message: 'Error recording flashcard review', error: error.message });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    // Find top 10 users by points
    const leaderboard = await UserProfile.find()
      .sort({ points: -1 })
      .limit(10)
      .select('userId displayName points level streak achievements')
      .lean();
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

module.exports = {
  getOrCreateProfile,
  updateProfile,
  awardTaskPoints,
  awardPomodoroPoints,
  awardFlashcardPoints,
  getLeaderboard
};
