const express = require("express");
const Project = require("../models/Project");
const router = express.Router();

// Auth middleware (reuse from todoRoutes)
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user.id = decoded.id;
        next();
    });
};

// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
});

// Create project
router.post("/", async (req, res) => {
    console.log(req, "useridddddd");

    try {
        const project = new Project({
            ...req.body,
            userId: req.user.id
        });
        console.log('project', project);
        
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
});

// Update project
router.put("/:id", async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        console.log(project, "project");

        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Error updating project", error: error.message });
    }
});

// Delete project
router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project", error: error.message });
    }
});

module.exports = router;