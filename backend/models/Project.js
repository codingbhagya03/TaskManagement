const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    // Change this to match frontend
    teamMembers: [{ type: String }], // Now an array of strings
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    budget: { type: Number, required: true },
    totalTime: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }]
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);