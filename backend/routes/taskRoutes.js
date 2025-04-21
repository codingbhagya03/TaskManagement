const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Error fetching tasks", details: error.message });
  }
});

// Get Available Status Options
router.get("/statuses", async (req, res) => {
  try {
    const statuses = ["Pending", "Starting", "Completed"];
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching statuses" });
  }
});

// Get Tasks by Time Range
router.get("/:timeRange", async (req, res) => {
  try {
    const { timeRange } = req.params; // week, month, year
    const startDate = new Date();
    
    if (timeRange === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const tasks = await Task.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          completed: { $sum: "$completed" },
          pending: { $sum: "$pending" },
        }
      },
      { $sort: { "_id": 1 } },
    ]);
    
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedTasks = tasks.map(task => ({
      name: dayMap[task._id - 1],
      completed: task.completed,
      pending: task.pending
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error("Error fetching task data:", error);
    res.status(500).json({ message: "Error fetching task data", details: error.message });
  }
});

// Create New Task
router.post("/", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!req.body.projects) {
      return res.status(400).json({ error: "Project is required" });
    }
    if (!req.body.status) {
      return res.status(400).json({ error: "Status is required" });
    }
    if (!req.body.priority) {
      return res.status(400).json({ error: "Priority is required" });
    }
    
    // Set appropriate defaults and format for the task
    const taskData = {
      ...req.body,
      date: new Date(),
      // Set completed/pending based on status
      completed: req.body.status === "Completed" ? 1 : 0,
      pending: req.body.status === "Completed" ? 0 : 1,
      // Ensure assignedUsers is an array
      assignedUsers: Array.isArray(req.body.assignedUsers) 
        ? req.body.assignedUsers 
        : (req.body.assignedUsers ? [req.body.assignedUsers] : [])
    };
    
    const newTask = new Task(taskData);
    console.log('New Task:', newTask);
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error occurred while saving the task:', error);
    res.status(500).json({ 
      error: "Error saving task", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    // Format data for update
    const updateData = {
      ...req.body,
      // Update completed/pending based on status (if status was updated)
      ...(req.body.status && {
        completed: req.body.status === "Completed" ? 1 : 0,
        pending: req.body.status === "Completed" ? 0 : 1
      })
    };

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Error updating task", details: error.message });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Error deleting task", details: error.message });
  }
});

module.exports = router;