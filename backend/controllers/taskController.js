const Task = require('../models/Task');

// Create Task
const createTask = async (req, res) => {
    try {
      // Log the request body for debugging
      console.log('Task creation request body:', req.body);
      
      const { subject, description, priority, targetDateTime, status, userId, isReviewTask } = req.body;
      
      // Create a task object with default userId if not provided
      const taskData = {
        subject,
        description,
        priority,
        targetDateTime,
        status,
        userId: userId || 'defaultuser123',
        isReviewTask: isReviewTask || false
      };
      
      // If this is a review task, set up initial spaced repetition parameters
      if (isReviewTask) {
        taskData.reviewLevel = 0;
        taskData.nextReviewAt = new Date(); // Set for immediate review
      }
      
      console.log('Creating task with data:', taskData);
      
      const newTask = new Task(taskData);
      
      const savedTask = await newTask.save();
      console.log('Task saved successfully:', savedTask);
      
      res.status(201).json({ 
        message: "Task created successfully", 
        task: savedTask
      });
    } catch (error) {
      console.error("Error creating task:", error.message);
      res.status(500).json({ message: "Error creating task", error: error.message });
    }
  };

// Get All Tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
};

// Get Task Statistics
const getTaskStats = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.userId || 'defaultuser123';
    console.log('Getting stats for user:', userId);
    
    // Get all tasks for this user
    const allTasks = await Task.find({ userId }).sort({ targetDateTime: 1 });
    console.log(`Found ${allTasks.length} tasks for user ${userId}`);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Categorize tasks with safer filtering
    const todaysTasks = allTasks.filter(task => {
      if (!task.targetDateTime) return false;
      const taskDate = new Date(task.targetDateTime);
      return taskDate >= today && taskDate < tomorrow;
    });
    
    const completedTasks = allTasks.filter(task => task.status === "Completed");
    
    const pendingTasks = allTasks.filter(task => task.status !== "Completed");
    
    const dueTasks = allTasks.filter(task => {
      if (!task.targetDateTime) return false;
      const taskDate = new Date(task.targetDateTime);
      return taskDate < now && task.status !== "Completed";
    });
    
    const upcomingTasks = allTasks.filter(task => {
      if (!task.targetDateTime) return false;
      const taskDate = new Date(task.targetDateTime);
      return taskDate > tomorrow && task.status !== "Completed";
    });
    
    // Count by status
    const notStartedCount = allTasks.filter(task => task.status === "Not Started").length;
    const inProgressCount = allTasks.filter(task => task.status === "In Progress").length;
    const completedCount = completedTasks.length;
    const totalCount = allTasks.length;
    
    const responseData = {
      todaysTasks,
      dueTasks,
      completedTasks,
      upcomingTasks,
      pendingTasks,
      stats: {
        totalTasks: totalCount,
        completedTasks: completedCount,
        inProgressTasks: inProgressCount,
        notStartedTasks: notStartedCount,
        pendingTasks: totalCount - completedCount
      }
    };

    console.log('Sending stats response with structure:', Object.keys(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching task statistics:", err);
    // Return a well-formed response even in case of error
    res.status(500).json({ 
      message: "Error fetching task statistics", 
      error: err.message,
      todaysTasks: [],
      dueTasks: [],
      completedTasks: [],
      upcomingTasks: [],
      pendingTasks: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        pendingTasks: 0
      }
    });
  }
};

// Get Due Review Tasks
const getDueReviewTasks = async (req, res) => {
  try {
    const now = new Date();
    
    // Find all review tasks that are due for review
    const dueReviewTasks = await Task.find({
      isReviewTask: true,
      nextReviewAt: { $lte: now },
      status: { $ne: 'Completed' }
    }).sort({ nextReviewAt: 1 });
    
    res.status(200).json(dueReviewTasks);
  } catch (err) {
    console.error("Error fetching due review tasks:", err);
    res.status(500).json({ message: "Error fetching due review tasks", error: err.message });
  }
};

// Complete Review and Schedule Next Review
const completeReview = async (req, res) => {
  try {
    const { taskId, difficultyRating } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    
    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (!task.isReviewTask) {
      return res.status(400).json({ message: "This is not a review task" });
    }
    
    // Update difficulty rating if provided
    if (difficultyRating && difficultyRating >= 1 && difficultyRating <= 5) {
      task.difficultyRating = difficultyRating;
    }
    
    // Calculate next review date based on spaced repetition algorithm
    const now = new Date();
    task.lastReviewedAt = now;
    
    // Increment review level (0 = first review, 1 = second review, etc.)
    task.reviewLevel += 1;
    
    // Calculate days until next review based on review level and difficulty
    // Using a simplified version of the SuperMemo-2 algorithm
    let daysUntilNextReview;
    
    if (task.reviewLevel === 1) {
      daysUntilNextReview = 1; // First review: 1 day
    } else if (task.reviewLevel === 2) {
      daysUntilNextReview = 3; // Second review: 3 days
    } else {
      // For subsequent reviews, use the formula:
      // days = previousDays * easeFactor
      // Where easeFactor is inversely related to difficulty (easier = longer intervals)
      const easeFactor = 2.5 - (0.3 * (task.difficultyRating - 3));
      const previousDays = Math.round((now - task.lastReviewedAt) / (1000 * 60 * 60 * 24));
      daysUntilNextReview = Math.max(1, Math.round(previousDays * easeFactor));
    }
    
    // Apply difficulty modifier
    // Harder items (4-5) get reviewed more frequently
    if (task.difficultyRating >= 4) {
      daysUntilNextReview = Math.max(1, Math.floor(daysUntilNextReview * 0.7));
    }
    // Easier items (1-2) get reviewed less frequently
    else if (task.difficultyRating <= 2) {
      daysUntilNextReview = Math.ceil(daysUntilNextReview * 1.3);
    }
    
    // Set next review date
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilNextReview);
    task.nextReviewAt = nextReviewDate;
    
    // Save the updated task
    await task.save();
    
    res.status(200).json({
      message: "Review completed successfully",
      task,
      nextReviewIn: daysUntilNextReview
    });
  } catch (err) {
    console.error("Error completing review:", err);
    res.status(500).json({ message: "Error completing review", error: err.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskStats,
  getDueReviewTasks,
  completeReview
};
