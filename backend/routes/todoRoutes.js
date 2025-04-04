const express = require("express");
const Todo = require("../models/Todo");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ✅ Middleware to check authentication
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user.id = decoded.id; // ✅ Save userId for later use
    next();
  });
};

// 🟢 **1. Get all Todos (User-Specific)**
router.get("/todos", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }); // 🔥 Fetch user-specific todos
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 **2. Add a New Todo**
router.post("/todos", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTodo = new Todo({
      title,
      description,
      userId: req.user.id, // From authMiddleware
      completed: false
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      message: "Error saving todo",
      error: err.message 
    });
  }
});
// 🟡 **3. Update a Todo (Complete/Uncomplete)**
router.put("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 **4. Delete a Todo**
router.delete("/todos/:id", authMiddleware, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
