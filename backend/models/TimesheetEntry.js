const mongoose = require("mongoose");

const TimesheetEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  
  // Project information
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  projectName: { type: String, required: true },
  
  // Task information
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  taskName: { type: String, required: true },
  
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("TimesheetEntry", TimesheetEntrySchema);