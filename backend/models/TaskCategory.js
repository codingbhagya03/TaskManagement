// models/TaskCategory.js
const mongoose = require("mongoose");

const taskCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  value: { type: Number, required: true },
});

module.exports = mongoose.model("TaskCategory", taskCategorySchema);
