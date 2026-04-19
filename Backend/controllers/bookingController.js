import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Professional from "../models/professionalModel.js";

/**
 * Create a new booking
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const {
      serviceTitle,
      serviceProvider,
      professionalId,
      fullName,
      workDescription,
      timeSchedule,
      bookingDate,
      location,
      hourlyRate,
      totalCost,
      rating,
      notes
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!serviceTitle || !serviceProvider || !fullName || !workDescription || !timeSchedule || !bookingDate || !location) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const booking = new Booking({
      userId,
      professionalId: professionalId || null,
      serviceTitle,
      serviceProvider,
      fullName,
      workDescription,
      timeSchedule,
      bookingDate,
      location,
      hourlyRate: hourlyRate || "रू 0.00",
      totalCost: totalCost || "रू 0.00",
      rating: rating || 0,
      notes: notes || "",
      status: "Pending"
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message
    });
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("professionalId", "firstName lastName serviceCategory profileImage");

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

/**
 * Get a single booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("professionalId", "firstName lastName serviceCategory profileImage");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message
    });
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const validStatuses = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, notes: notes || "" },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Trigger notification for the user
    try {
      const { createNotification } = await import("./notificationController.js");
      let title = "";
      let description = "";

      if (status === "Confirmed") {
        title = "Service Request Accepted! 🎉";
        description = `${booking.serviceProvider} has accepted your request for ${booking.serviceTitle}. Check 'My Bookings' for details.`;
      } else if (status === "Rejected") {
        title = "Service Request Declined";
        const reasonPart = notes ? ` Reason: ${notes}` : "";
        description = `Unfortunately, ${booking.serviceProvider} cannot fulfill your request for ${booking.serviceTitle} at this time.${reasonPart}`;
      } else {
        title = "Booking Status Updated";
        description = `Your booking for ${booking.serviceTitle} is now ${status}.`;
      }

      await createNotification(
        booking.userId,
        status === "Confirmed" ? "success" : status === "Rejected" ? "error" : "info",
        title,
        description,
        "/my-bookings"
      );
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
      // Don't fail the response if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message
    });
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message
    });
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const stats = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        total: totalBookings,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking stats",
      error: error.message
    });
  }
};

/**
 * Get all bookings for a professional
 */
export const getProfessionalBookings = async (req, res) => {
  try {
    const { professionalId } = req.params;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required"
      });
    }

    const bookings = await Booking.find({ professionalId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone profileImage address");

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error("Error fetching professional bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

/**
 * Get booking statistics for a professional
 */
export const getProfessionalStats = async (req, res) => {
  try {
    const { professionalId } = req.params;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required"
      });
    }

    // Convert string ID to ObjectId for aggregation
    const proId = new mongoose.Types.ObjectId(professionalId);

    // Get counts by status
    const statusStats = await Booking.aggregate([
      { $match: { professionalId: proId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total earnings from completed jobs
    // Note: totalCost is stored as "रू 1,200", we need to parse it
    const completedBookings = await Booking.find({
      professionalId: proId,
      status: "Completed"
    });

    let totalEarnings = 0;
    completedBookings.forEach(booking => {
      const costStr = booking.totalCost || "रू 0";
      const amount = parseFloat(costStr.replace(/[^\d.]/g, '')) || 0;
      totalEarnings += amount;
    });

    // Get professional details for rating
    const professional = await Professional.findById(professionalId);

    const stats = {
      pendingRequests: 0,
      completedJobs: 0,
      totalEarnings,
      rating: professional?.rating || 0,
      totalReviews: professional?.totalReviews || 0
    };

    statusStats.forEach(stat => {
      if (stat._id === "Pending") stats.pendingRequests = stat.count;
      if (stat._id === "Completed") stats.completedJobs = stat.count;
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching professional stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message
    });
  }
};
