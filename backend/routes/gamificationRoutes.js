const express = require('express');
const router = express.Router();
const {
    getUserStats,
    awardTaskPoints,
    getLeaderboard,
    dailyCheckIn
} = require('../controllers/gamificationController');

const { protect } = require('../middleware/authMiddleware');

// Award points for completing a task
router.post('/award/task', protect, awardTaskPoints);

// Get user gamification stats
router.get('/stats', protect, getUserStats);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

// Daily check-in
router.post('/check-in', protect, dailyCheckIn);

module.exports = router;
