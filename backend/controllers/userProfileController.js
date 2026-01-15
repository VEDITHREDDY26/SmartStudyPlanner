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
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const { displayName, bio, avatar, theme, notifications, emailPreferences } = req.body;
    
    // Update user profile
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (theme !== undefined) updateData.theme = theme;
    if (notifications) {
      updateData['notifications.email'] = notifications.email !== undefined ? notifications.email : true;
      updateData['notifications.push'] = notifications.push !== undefined ? notifications.push : false;
    }
    if (emailPreferences) {
      updateData['emailPreferences.dailyReminder'] = 
        emailPreferences.dailyReminder !== undefined ? emailPreferences.dailyReminder : true;
      updateData['emailPreferences.taskReminders'] = 
        emailPreferences.taskReminders !== undefined ? emailPreferences.taskReminders : true;
      updateData['emailPreferences.weeklySummary'] = 
        emailPreferences.weeklySummary !== undefined ? emailPreferences.weeklySummary : true;
    }
    
    // Find and update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: updateData,
        ...(displayName && { name: displayName }), // Also update the name in the User model
        updatedAt: new Date()
      },
      { new: true, select: '-password' } // Don't return the password
    );

    // Update the profile as well
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: userId.toString() },
      { 
        $set: {
          displayName: displayName || updatedUser?.name,
          bio,
          avatar,
          theme,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      ...updatedUser.toObject(),
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
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
