import axios from "axios";

const API_URL = "http://localhost:5001/api/admin";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL
});

/**
 * Get dashboard statistics
 * @returns {Promise} Dashboard stats (totalApplications, pending, approved, rejected)
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch dashboard stats"
    };
  }
};

/**
 * Get analytics data
 * @returns {Promise} Comprehensive analytics (total, verified, pending, rejected, averageWage, topCategories, topAreas)
 */
export const getAnalyticsData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/analytics`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch analytics"
    };
  }
};

/**
 * Get recent applications
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} List of recent applications
 */
export const getRecentApplications = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/recent`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch recent applications"
    };
  }
};

/**
 * Get all professionals for admin view
 * @param {Object} params - Query parameters (page, limit, status, serviceCategory)
 * @returns {Promise} List of professionals with pagination
 */
export const getAllProfessionalsForAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/professionals`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch professionals"
    };
  }
};

/**
 * Get pending applications
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} List of pending applications
 */
export const getPendingApplications = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/professionals/pending`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch pending applications"
    };
  }
};

/**
 * Get application details
 * @param {String} id - Application MongoDB ID
 * @returns {Promise} Complete application details with documents
 */
export const getApplicationDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/professionals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch application details"
    };
  }
};

/**
 * Search professionals with filters
 * @param {Object} params - Query parameters (search, status, category, area, page, limit)
 * @returns {Promise} Search results with pagination
 */
export const searchProfessionals = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/professionals/search`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Search failed"
    };
  }
};

/**
 * Approve professional application
 * @param {String} id - Application MongoDB ID
 * @returns {Promise} Updated professional data
 */
export const approveProfessional = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/applications/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to approve professional"
    };
  }
};

/**
 * Reject professional application
 * @param {String} id - Application MongoDB ID
 * @param {String} rejectionReason - Reason for rejection
 * @returns {Promise} Updated professional data
 */
export const rejectProfessional = async (id, rejectionReason) => {
  try {
    const response = await axios.patch(`${API_URL}/applications/${id}/reject`, {
      rejectionReason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to reject professional"
    };
  }
};

/**
 * Get category distribution
 * @returns {Promise} Breakdown by service category
 */
export const getCategoryDistribution = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/categories`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch category distribution"
    };
  }
};

/**
 * Get status distribution
 * @returns {Promise} Breakdown by verification status
 */
export const getStatusDistribution = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch status distribution"
    };
  }
};

/**
 * Export data
 * @param {Object} params - Query parameters (format: 'json'|'csv', status)
 * @returns {Promise} Exported data
 */
export const exportData = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/export`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to export data"
    };
  }
};

export default {
  getDashboardStats,
  getAnalyticsData,
  getRecentApplications,
  getAllProfessionalsForAdmin,
  getPendingApplications,
  getApplicationDetails,
  searchProfessionals,
  approveProfessional,
  rejectProfessional,
  getCategoryDistribution,
  getStatusDistribution,
  exportData
};
