const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  targetDateTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  userId: {
    type: String,
    default: 'defaultuser123'
  },
  // Fields for spaced repetition
  isReviewTask: {
    type: Boolean,
    default: false
  },
  reviewLevel: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date
  },
  nextReviewAt: {
    type: Date
  },
  difficultyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
