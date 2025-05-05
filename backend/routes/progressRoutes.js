const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// All routes are protected with authentication
router.use(auth);

// Get progress stats
router.get('/stats', progressController.getProgressStats);

// Update study time
router.post('/study-time', progressController.updateStudyTime);

// Update completed tasks
router.post('/completed-tasks', progressController.updateCompletedTasks);

// Update early bird tasks
router.post('/early-bird-task', progressController.updateEarlyBirdTask);

// Update completed Pomodoros
router.post('/completed-pomodoros', progressController.updateCompletedPomodoros);

// Update flashcards reviewed
router.post('/flashcards-reviewed', progressController.updateFlashcardsReviewed);

// Update streak
router.post('/streak', progressController.updateStreak);

module.exports = router; 