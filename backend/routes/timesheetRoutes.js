const express = require("express");
const TimesheetEntry = require("../models/TimesheetEntry");

const router = express.Router();

// ✅ Create a new timesheet entry (User ID from req.user.id)
router.post("/", async (req, res) => {
  try {
    const { projectId, projectName, taskId, taskName, date, startTime, endTime, duration } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Calculate duration if not provided
    let calculatedDuration = duration;
    if (!calculatedDuration && startTime && endTime) {
      // Simple duration calculation logic
      // This is a placeholder - you'd want to implement actual time calculation
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMin - startMin;
      
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Assuming work doesn't span multiple days
      }
      
      calculatedDuration = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    
    const newEntry = new TimesheetEntry({
      userId: req.user.id, // ✅ Authenticated User ID
      projectId,
      projectName,
      taskId,
      taskName,
      date,
      startTime,
      endTime,
      duration: calculatedDuration,
    });
    
    await newEntry.save();
    res.status(201).json({ message: "Timesheet entry added successfully", newEntry });
  } catch (error) {
    console.error("Error adding timesheet entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all timesheet entries for logged-in user
router.get("/", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const entries = await TimesheetEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching timesheet entries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a timesheet entry
router.put("/:id", async (req, res) => {
  try {
    const { projectId, projectName, taskId, taskName, date, startTime, endTime, duration } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Find the entry and check if it belongs to the user
    const entry = await TimesheetEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this entry" });
    }
    
    // Calculate duration if not provided
    let calculatedDuration = duration;
    if (!calculatedDuration && startTime && endTime) {
      // Simple duration calculation logic
      // This is a placeholder - you'd want to implement actual time calculation
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMin - startMin;
      
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Assuming work doesn't span multiple days
      }
      
      calculatedDuration = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    
    // Update the entry
    entry.projectId = projectId;
    entry.projectName = projectName;
    entry.taskId = taskId;
    entry.taskName = taskName;
    entry.date = date;
    entry.startTime = startTime;
    entry.endTime = endTime;
    entry.duration = calculatedDuration;
    
    await entry.save();
    
    res.json({ message: "Entry updated successfully", entry });
  } catch (error) {
    console.error("Error updating timesheet entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a timesheet entry
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Find the entry and check if it belongs to the user
    const entry = await TimesheetEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this entry" });
    }
    
    // Delete the entry
    await TimesheetEntry.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting timesheet entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;