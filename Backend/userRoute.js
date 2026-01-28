import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "./models/userModel.js";
import { sendOtpEmail } from "./utils/sendOtp.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(path.resolve(), "Backend", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Username does not exist or is not verified" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      userId: user._id,
      name: user.name,
      verified: user.isVerified
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   UPDATE PROFILE
========================= */
router.put("/:userId/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, location, username } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.name = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (username) user.username = username;

    if (req.file) {
      // store relative path to uploads
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;

