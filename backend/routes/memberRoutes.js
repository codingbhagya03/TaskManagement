const express = require("express");
const Member = require("../models/Member");
const router = express.Router();

// Define available roles globally
const availableRoles = ["Admin", "Manager", "Developer", "Designer"];

// GET all members
router.get("/", async (_req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching members" });
  }
});

// GET roles endpoint - IMPORTANT: This specific route must come BEFORE the /:id route
router.get("/roles", (req, res) => {
  try {
    console.log("Roles endpoint hit");
    res.status(200).json(availableRoles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ message: "Error fetching roles" });
  }
});

// GET a specific member by ID - This comes AFTER the /roles route
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching member" });
  }
});

// POST a new member
router.post("/", async (req, res) => {
  try {
    const { name, email, roles, timeToday, timeThisWeek } = req.body;

    // Check that the roles are valid
    if (!roles || roles.length === 0) {
      return res.status(400).json({ message: "Roles are required" });
    }

    // Ensure the roles are from the available list
    const invalidRoles = roles.filter(role => !availableRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ message: `Invalid roles: ${invalidRoles.join(", ")}` });
    }

    const newMember = new Member({
      name,
      email,
      roles,
      timeToday,
      timeThisWeek,
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating member" });
  }
});

// PUT (update) an existing member
router.put("/:id", async (req, res) => {
  try {
    const { name, email, roles, timeToday, timeThisWeek } = req.body;

    // Check that the roles are valid
    if (!roles || roles.length === 0) {
      return res.status(400).json({ message: "Roles are required" });
    }

    // Ensure the roles are from the available list
    const invalidRoles = roles.filter(role => !availableRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ message: `Invalid roles: ${invalidRoles.join(", ")}` });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { name, email, roles, timeToday, timeThisWeek },
      { new: true } // Return the updated member
    );
    
    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.status(200).json(updatedMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating member" });
  }
});

// DELETE a member
router.delete("/:id", async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting member" });
  }
});

module.exports = router;