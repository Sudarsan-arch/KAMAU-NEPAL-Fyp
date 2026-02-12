import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    username: { type: String },
    profileImage: { 
      type: String,
      default: null,
      // Note: Base64 encoded images are stored as strings
      // A typical 1MB image becomes ~1.33MB as base64
    },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
