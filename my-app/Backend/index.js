import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./userRoute.js";
import professionalRoute from "./professionalRoute.js";
import adminRoute from "./adminRoute.js";
import authRoute from "./authRoute.js";
import bookingRoute from "./bookingRoute.js";
import reviewRoute from "./reviewRoute.js";
import notificationRoute from "./notificationRoute.js";
import messageRoute from "./messageRoute.js";
import paymentRoute from "./paymentRoute.js";
import path from "path";

dotenv.config();

const app = express();
// Priority: Environment Variable > Default 5000
const PORT = process.env.PORT || 5000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use("/api/professionals", professionalRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/payments", paymentRoute);

// Serve uploaded images
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

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
