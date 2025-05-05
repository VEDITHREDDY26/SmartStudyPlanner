const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskStats,
  getDueReviewTasks,
  completeReview
} = require('../controllers/taskController');

const router = express.Router();

// Task statistics endpoint - place first and add authentication middleware
router.get('/stats', protect, getTaskStats);

// Spaced repetition endpoints
router.get('/reviews/due', protect, getDueReviewTasks);
router.post('/reviews/complete', protect, completeReview);

// Task creation routes with authentication
router.post('/create', protect, createTask);
router.post('/', protect, createTask);

// Add authentication middleware to update and delete routes
router.get('/', protect, getAllTasks);
router.put('/:id', protect, updateTask); // Update task endpoint
router.delete('/:id', protect, deleteTask); // Delete task endpoint

// New direct task creation route without authentication middleware (temporary solution)
router.post('/create-direct', (req, res) => {
  try {
    const Task = require('../models/Task');
    const { subject, description, priority, targetDateTime, status } = req.body;
    
    console.log('Direct task creation request:', req.body);
    
    const newTask = new Task({
      subject,
      description,
      priority,
      targetDateTime,
      status,
      userId: "defaultuser123" // Hardcoded userId as a workaround
    });
    
    newTask.save()
      .then(task => {
        console.log('Task created successfully:', task);
        res.status(201).json({ message: "Task created successfully", task });
      })
      .catch(err => {
        console.error('Error saving task:', err);
        res.status(500).json({ message: "Error creating task", error: err.message });
      });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
