import ProfessionalModel from '../models/professionalModel.js';

/**
 * Get admin dashboard statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await ProfessionalModel.countDocuments();
    const totalPending = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });
    const totalApproved = await ProfessionalModel.countDocuments({ verificationStatus: 'verified' });
    const totalRejected = await ProfessionalModel.countDocuments({ verificationStatus: 'rejected' });

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        totalPending,
        totalApproved,
        totalRejected
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get all professionals with filters for admin view
 * @param {Object} req - Request object (query params: page, limit, status, serviceCategory)
 * @param {Object} res - Response object
 */
export const getAllProfessionalsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceCategory } = req.query;

    const query = {};
    if (status) {
      query.verificationStatus = status;
    }
    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professionals',
      error: error.message
    });
  }
};

/**
 * Get pending applications for admin review
 * @param {Object} req - Request object (query params: page, limit)
 * @param {Object} res - Response object
 */
export const getPendingApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await ProfessionalModel.find({ verificationStatus: 'pending' })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error.message
    });
  }
};

/**
 * Get category distribution for analytics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await ProfessionalModel.aggregate([
      { $match: { verificationStatus: 'verified' } },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedData = distribution.map(item => ({
      category: item._id,
      count: item.count
    }));

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category distribution',
      error: error.message
    });
  }
};

/**
 * Get status distribution (pending, approved, rejected)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getStatusDistribution = async (req, res) => {
  try {
    const distribution = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedData = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    distribution.forEach(item => {
      if (item._id === 'pending') formattedData.pending = item.count;
      else if (item._id === 'verified') formattedData.verified = item.count;
      else if (item._id === 'rejected') formattedData.rejected = item.count;
    });

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch status distribution',
      error: error.message
    });
  }
};

/**
 * Get recent applications (for dashboard display)
 * @param {Object} req - Request object (query params: limit)
 * @param {Object} res - Response object
 */
export const getRecentApplications = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const applications = await ProfessionalModel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent applications',
      error: error.message
    });
  }
};

/**
 * Get detailed application information
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ProfessionalModel.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
};

/**
 * Approve a professional application
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const approveProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      {
        verificationStatus: 'verified',
        verificationDate: new Date()
      },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional approved successfully',
      data: professional
    });
  } catch (error) {
    console.error('Error approving professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve professional',
      error: error.message
    });
  }
};

/**
 * Reject a professional application
 * @param {Object} req - Request object (params: id, body: rejectionReason)
 * @param {Object} res - Response object
 */
export const rejectProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      {
        verificationStatus: 'rejected',
        rejectionReason,
        verificationDate: new Date()
      },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional rejected successfully',
      data: professional
    });
  } catch (error) {
    console.error('Error rejecting professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject professional',
      error: error.message
    });
  }
};

/**
 * Get analytics data (statistics over time, category trends, etc.)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAnalyticsData = async (req, res) => {
  try {
    // Total statistics
    const totalProfessionals = await ProfessionalModel.countDocuments();
    const verifiedCount = await ProfessionalModel.countDocuments({ verificationStatus: 'verified' });
    const pendingCount = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });
    const rejectedCount = await ProfessionalModel.countDocuments({ verificationStatus: 'rejected' });

    // Average hourly wage
    const avgWageData = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: null,
          averageWage: { $avg: '$hourlyWage' }
        }
      }
    ]);

    const averageWage = avgWageData.length > 0 ? avgWageData[0].averageWage : 0;

    // Top categories
    const topCategories = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top areas
    const topAreas = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$serviceArea',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProfessionals,
        verified: verifiedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        averageHourlyWage: Math.round(averageWage),
        topCategories: topCategories.map(cat => ({
          category: cat._id,
          count: cat.count
        })),
        topAreas: topAreas.map(area => ({
          area: area._id,
          count: area.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

/**
 * Search professionals with multiple filters
 * @param {Object} req - Request object (query params: search, status, category, area, page, limit)
 * @param {Object} res - Response object
 */
export const searchProfessionals = async (req, res) => {
  try {
    const { search, status, category, area, page = 1, limit = 20 } = req.query;

    const query = {};

    // Search by name, email, or username
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.verificationStatus = status;
    }

    if (category) {
      query.serviceCategory = category;
    }

    if (area) {
      query.serviceArea = area;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Export data (CSV/JSON)
 * @param {Object} req - Request object (query params: format, status)
 * @param {Object} res - Response object
 */
export const exportData = async (req, res) => {
  try {
    const { format = 'json', status } = req.query;

    const query = status ? { verificationStatus: status } : {};
    const professionals = await ProfessionalModel.find(query).select('-verificationDocuments');

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(professionals);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="professionals.csv"');
      return res.send(csv);
    }

    // Default JSON format
    return res.status(200).json({
      success: true,
      data: professionals
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

/**
 * Helper function to convert data to CSV
 */
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Service', 'Area', 'Wage', 'Status', 'Created At'];
  const rows = data.map(item => [
    item.firstName,
    item.lastName,
    item.email,
    item.phone,
    item.serviceCategory,
    item.serviceArea,
    item.hourlyWage,
    item.verificationStatus,
    new Date(item.createdAt).toLocaleDateString()
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  return csv;
};
