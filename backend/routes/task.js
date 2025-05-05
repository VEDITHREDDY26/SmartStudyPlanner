// import express from "express";
const express = require("express");
// import Task from "../models/Task.js";
const Task = require("../models/Task"); // assumes Task model is defined in models/Task.js
const { protect } = require("../middleware/authMiddleware"); // Use the correct middleware

const router = express.Router();

// Add Task
router.post("/", protect, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.user._id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tasks for user
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ targetDateTime: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put("/:id", protect, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete("/:id", protect, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
