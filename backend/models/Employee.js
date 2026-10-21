const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  // Add these fields for OTP-based password reset
  resetOTP: {
    type: String
  },
  resetOTPExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EmployeeModel = mongoose.model("employees", EmployeeSchema);
module.exports = EmployeeModel;