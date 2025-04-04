const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// ✅ Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// ✅ Create an event
router.post("/", async (req, res) => {
  try {
    const { title, description, type, date, startTime, endTime } = req.body;
    const newEvent = new Event({
      title,
      description,
      type,
      date,
      startTime,
      endTime,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ message: "Error creating event" });
  }
});

// ✅ Update an event
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, type, date, startTime, endTime } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, type, date, startTime, endTime },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(400).json({ message: "Error updating event" });
  }
});

// ✅ Delete an event
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

module.exports = router;
