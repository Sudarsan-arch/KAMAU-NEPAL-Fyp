import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "./models/userModel.js";
import AdminModel from "./models/adminModel.js";
import ProfessionalModel from "./models/professionalModel.js";
import { sendOtpEmail } from "./utils/sendOtp.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

/* =========================
   TEST
========================= */
router.get("/", (req, res) => {
  res.send("User route working");
});

/* =========================
   SIGNUP + SEND OTP
========================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    await sendOtpEmail(email, otp);

    console.log("OTP SENT:", otp); // dev only

    res.status(201).json({
      message: "Signup successful. OTP sent to email.",
      userId: user._id,
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   VERIFY OTP
========================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if OTP is empty or null
    if (!user.otp) {
      return res.status(400).json({ message: "No OTP found. Please sign up again or resend OTP." });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log("User verified and saved:", user._id);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      isVerified: true,
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   RESEND OTP
========================= */
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newOtp = crypto.randomInt(100000, 999999).toString();

    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, newOtp);

    console.log("OTP RESENT:", newOtp); // dev only

    res.json({ message: "New OTP sent to your email" });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // First, check if it's a regular user
    let user = await User.findOne({ email });
    let role = "user";

    if (!user) {
      // If no user found, check if it's an admin (search by email or username)
      const admin = await AdminModel.findOne({
        $or: [{ email }, { username: email }],
        isActive: true
      });

      if (admin) {
        // Compare password for admin using bcryptjs
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
          {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "1d" }
        );

        return res.json({
          message: "Admin login successful",
          token,
          userId: admin._id,
          name: admin.fullName,
          role: "admin",
          verified: true,
          data: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            permissions: admin.permissions
          }
        });
      }

      return res.status(404).json({ message: "User not found" });
    }

    // Regular user verification
    if (!user.isVerified) {
      return res.status(401).json({ message: "Username does not exist or is not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Check if this user is a verified professional
    const professional = await ProfessionalModel.findOne({ 
      $or: [{ email: user.email }, { userId: user._id }], 
      verificationStatus: "verified" 
    });
    
    const token = jwt.sign(
      { id: user._id, role: professional ? "professional" : "user" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      role: professional ? "professional" : "user",
      verified: user.isVerified
    });

/* =========================
   GOOGLE LOGIN / SIGNUP
========================= */
router.post("/google-login", async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Fetch user info from Google using the access token
    const googleUserRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
    const { email, name, picture, sub: googleId } = googleUserRes.data;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for first-time Google sign-in
      user = await User.create({
        name: name,
        email: email,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password for social logins
        address: "Address not provided (Google Login)",
        profileImage: picture,
        isVerified: true, // Google accounts are pre-verified
        googleId: googleId
      });
      console.log("New user created via Google Login:", user._id);
    } else {
      // Update existing user with Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profileImage) user.profileImage = picture;
        user.isVerified = true;
        await user.save();
      }
      console.log("Existing user logged in via Google:", user._id);
    }

    // Check if professional
    const professional = await ProfessionalModel.findOne({ 
      $or: [{ email: user.email }, { userId: user._id }], 
      verificationStatus: "verified" 
    });

    // Generate platform JWT
    const token = jwt.sign(
      { id: user._id, role: professional ? "professional" : "user" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      userId: user._id,
      name: user.name,
      role: professional ? "professional" : "user",
      verified: true
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google authentication failed", error: err.message });
  }
});

/* =========================
   UPDATE PROFILE
========================= */
router.put("/:userId/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, location, username, profileImage } = req.body;

    console.log("Profile update request for userId:", userId);
    console.log("Request body fields:", { fullName, email, phone, location, username });
    console.log("Profile image provided:", !!profileImage);
    console.log("File uploaded:", !!req.file);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.name = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) {
      user.address = location;
      user.formattedAddress = location;
    }
    if (username) user.username = username;

    // Handle profile image
    if (req.file) {
      // If a file was uploaded via multer
      console.log("Saving profile image from uploaded file:", req.file.path);
      const imageData = fs.readFileSync(req.file.path);
      user.profileImage = `data:${req.file.mimetype};base64,${imageData.toString("base64")}`;

      // Delete temporary file
      fs.unlinkSync(req.file.path);
      console.log("Temporary file deleted");
    } else if (profileImage && profileImage.startsWith("data:")) {
      // If a base64 string was sent in the body
      console.log("Saving profile image from base64 string");
      user.profileImage = profileImage;
    } else {
      console.log("No new profile image provided");
    }

    await user.save();
    console.log("User profile saved successfully");

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        formattedAddress: user.formattedAddress,
        hasProfileImage: !!user.profileImage,
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile: " + err.message });
  }
});

/* =========================
   GET USER PROFILE
========================= */
router.get("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User profile retrieved",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        username: user.username,
        profileImage: user.profileImage,
        formattedAddress: user.formattedAddress,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* =========================
   LOCATION UPDATES
========================= */
import { updateLocation, getNearbyProfessionals } from "./controllers/locationController.js";
import { verifyToken } from "./authMiddleware.js";

router.put("/update-location", verifyToken, updateLocation);
router.get("/nearby-professionals", verifyToken, getNearbyProfessionals);

export default router;

