const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  roles: { type: [String], required: true }, 
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], 
  timeToday: { type: Number, default: 0 }, // Time in minutes
  timeThisWeek: { type: Number, default: 0 },
});

module.exports = mongoose.model("Member", MemberSchema);
