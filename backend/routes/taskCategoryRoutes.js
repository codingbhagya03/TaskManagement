const express = require("express");
const TaskCategory = require("../models/TaskCategory");

const router = express.Router();

// Route to fetch task distribution data
router.get("/", async (req, res) => {
  try {
    const categories = await TaskCategory.find();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching task category data" });
  }
});

module.exports = router;
