import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  getProfessionalBookings,
  getProfessionalStats
} from "./controllers/bookingController.js";
import { verifyToken } from "./authMiddleware.js"; // Correct named import

const router = express.Router();

// Create a new booking
router.post("/", createBooking);

// Get all bookings for a user
router.get("/user/:userId", getUserBookings);

// Get booking statistics
router.get("/stats/:userId", getBookingStats);

// Get professional bookings
router.get("/professional/:professionalId", getProfessionalBookings);

// Get professional statistics
router.get("/professional/:professionalId/stats", getProfessionalStats);

// Get a single booking by ID
router.get("/:id", getBookingById);

// Update booking status
router.patch("/:id", updateBookingStatus);

// Delete a booking
router.delete("/:id", deleteBooking);

export default router;
