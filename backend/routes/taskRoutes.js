const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

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
      { $sort: { "_id": 1 } }, // Sort by day of the week
    ]);

    // Map days from numbers to readable weekday names
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedTasks = tasks.map(task => ({
      name: dayMap[task._id - 1],  // Convert numeric day to string (1 = Sunday)
      completed: task.completed,
      pending: task.pending
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching task data" });
  }
});

// Create New Task
router.post("/", async (req, res) => {
  try {
    console.log(req.body,"reqqqqqqq");
    
    const newTask = new Task(req.body);
    console.log('newTask',newTask);
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error,'error');
    
    res.status(500).json({ error: "Error saving task" });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error updating task" });
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
    res.status(500).json({ error: "Error deleting task" });
  }
});

module.exports = router;