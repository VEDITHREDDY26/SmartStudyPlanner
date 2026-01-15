const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a method to get user's full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  return this.name || this.email.split('@')[0];
});

module.exports = mongoose.model("User", userSchema);
