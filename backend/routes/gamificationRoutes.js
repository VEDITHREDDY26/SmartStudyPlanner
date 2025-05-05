const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

// Award points for completing a task
router.post('/award/task', protect, gamificationController.awardTaskPoints);

// Get user gamification stats
router.get('/stats', protect, gamificationController.getUserStats);

// Get leaderboard
router.get('/leaderboard', protect, gamificationController.getLeaderboard);

module.exports = router;
