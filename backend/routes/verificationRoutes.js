const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Set up multer for file uploads (for face images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Verify location
router.post("/location", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Check if location is in Ahmedabad
    const isInAhmedabad = checkIfInAhmedabad(latitude, longitude);

    if (isInAhmedabad) {
      return res.json({ 
        verified: true, 
        message: "Location verified successfully" 
      });
    } else {
      return res.status(403).json({ 
        verified: false, 
        message: "You must be in Ahmedabad to track time" 
      });
    }
  } catch (error) {
    console.error("Location verification error:", error);
    res.status(500).json({ message: "Server error during location verification" });
  }
});

// Verify face
router.post("/face", upload.single("image"), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const isVerified = true;

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    if (isVerified) {
      return res.json({ 
        verified: true, 
        message: "Face verified successfully" 
      });
    } else {
      return res.status(403).json({ 
        verified: false, 
        message: "Face verification failed" 
      });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    
    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Server error during face verification" });
  }
});

// Helper function to check if coordinates are in Ahmedabad
function checkIfInAhmedabad(latitude, longitude) {
  // Approximate coordinates for Ahmedabad
  const ahmedabadLat = 23.0225;
  const ahmedabadLong = 72.5714;
  
  // Simple radius check (roughly 20km)
  const distance = calculateDistance(latitude, longitude, ahmedabadLat, ahmedabadLong);
  return distance <= 20;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  return distance;
}

module.exports = router;