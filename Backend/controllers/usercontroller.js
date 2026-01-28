import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// SIGN UP
export const signupUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const otp = generateOtp();

    const newUser = await User.create({ name, email, phone, password: hashedPassword, otp });
    
    // TODO: Send OTP via SMS/Email
    console.log("OTP sent:", otp);

    res.status(201).json({ message: "User created, OTP sent", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.json({ message: "OTP verified", token });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) return res.status(401).json({ message: "User not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
