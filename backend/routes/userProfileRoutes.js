const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateProfile,
  updateProfile,
  awardTaskPoints,
  awardPomodoroPoints,
  awardFlashcardPoints,
  getLeaderboard
} = require('../controllers/userProfileController');

const router = express.Router();

// Get or create user profile
router.get('/profile', protect, getOrCreateProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

// Award points for completing tasks
router.post('/award/task', protect, awardTaskPoints);

// Award points for completing Pomodoro sessions
router.post('/award/pomodoro', protect, awardPomodoroPoints);

// Award points for reviewing flashcards
router.post('/award/flashcard', protect, awardFlashcardPoints);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
