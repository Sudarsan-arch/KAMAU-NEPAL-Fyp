import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./userRoute.js";
import path from "path";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ===============================
   ROUTES
================================ */
app.use("/api/users", userRoutes);

// Serve uploaded images
app.use('/uploads', express.static(path.join(path.resolve(), 'Backend', 'uploads')));

/* ===============================
   DATABASE CONNECTION
================================ */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
