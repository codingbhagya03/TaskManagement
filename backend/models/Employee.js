const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store as plain text (Not recommended for security)
  // Add these fields for OTP-based password reset
  resetOTP: String,
  resetOTPExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EmployeeModel = mongoose.model("employees", EmployeeSchema);
module.exports = EmployeeModel;