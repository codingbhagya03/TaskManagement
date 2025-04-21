const mongoose = require("mongoose");

const TimesheetEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  // User information instead of Project/Task
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  userName: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
  // New fields for verification
  locationVerified: { type: Boolean, default: false },
  faceVerified: { type: Boolean, default: false },
  verificationTimestamp: { type: Date },
  // Store location information
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model("TimesheetEntry", TimesheetEntrySchema);