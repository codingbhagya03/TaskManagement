const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projects: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Starting", "Pending", "Completed"] 
  },
  priority: {
    type: String,
    required: true,
    enum: ["low", "medium", "high"]
  },
  startDate: { type: String },
  dueDate: { type: String },
  assignedUsers: [{ type: String }],
  // completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  
  date: { type: Date, default: Date.now }, 
  completed: { type: Number, default: 0 }, 
  pending: { type: Number, default: 0 },   

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);