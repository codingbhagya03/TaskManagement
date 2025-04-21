require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const EmployeeModel = require("./models/Employee");
const todoRoutes = require("./routes/todoRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const memberRoutes = require("./routes/memberRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const taskCategoryRoutes = require("./routes/taskCategoryRoutes");
const verificationRoutes = require("./routes/verificationRoutes"); // Add this import

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Change this to your frontend URL
    credentials: true,
  })
);
app.use(cookieParser());

// ✅ Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ✅ JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "ac53d90a08cd7ca18d63dd284a0c6f81a03808c69fd1054889314220e9d1d966";

// 🟢 **User Registration Route (Signup)**
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    // ✅ Store plain text password (Not Recommended for security)
    const newUser = new EmployeeModel({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});


// 🟢 **User Login Route (JWT in HTTP-only Cookie)**
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Direct password comparison (in a production app, use bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await EmployeeModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
});

app.put("/api/users/update", async (req, res) => {
  try {
    const { fullName, email, userId } = req.body;
    const user = await EmployeeModel.findById(userId || req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = fullName;  // Make sure this matches the field name in your model
    user.email = email;
    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
});

// Password update route
// Alternative password update route
app.put("/api/users/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await EmployeeModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    if (currentPassword !== user.password) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message
    });
  }
});

// Account deletion route - updated to use userId from request body
app.delete("/api/users/delete", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await EmployeeModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error details:", error);
    res.status(500).json({
      message: "Error deleting account",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// 🔹 **Check Authentication (Persistent Login)**
app.get("/check-auth", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.json({ isAuthenticated: false });
      }

      // Check if user exists
      try {
        const user = await EmployeeModel.findById(decoded.id);
        if (!user) {
          return res.json({ isAuthenticated: false });
        }

        return res.json({
          isAuthenticated: true,
          userId: decoded.id
        });
      } catch (userErr) {
        console.error("Error finding user:", userErr);
        return res.json({ isAuthenticated: false });
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.json({ isAuthenticated: false });
  }
});

// 🔴 **Logout Route (Clear Cookie)**
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });
  res.status(200).json({ message: "Logged out successfully", success: true }); // ✅ Success response
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ 🟢 **Auth Routes (Password Reset)**
app.use("/auth", authRoutes); // Add this line

// ✅ 🟢 **Todo Routes (Task Management)**
app.use("/api/todos", authMiddleware, todoRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);
app.use("/api/members", memberRoutes);
// app.use("/api/members/roles", memberRoutes);
app.use("/api/timesheets", authMiddleware, timesheetRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/taskcategories", taskCategoryRoutes);
app.use("/api/verification", authMiddleware, verificationRoutes); // Uncommented and added authMiddleware

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));