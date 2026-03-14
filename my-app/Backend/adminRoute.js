import express from 'express';
import {
  getDashboardStats,
  getAllProfessionalsForAdmin,
  getPendingApplications,
  getCategoryDistribution,
  getStatusDistribution,
  getRecentApplications,
  getApplicationDetails,
  approveProfessional,
  rejectProfessional,
  getAnalyticsData,
  searchProfessionals,
  exportData,
  broadcastNotification,
} from './controllers/adminController.js';
import { verifyAdminToken, checkAdminRole } from './adminAuthMiddleware.js';

const router = express.Router();

// Apply admin verification middleware to all routes
router.use(verifyAdminToken);
router.use(checkAdminRole);

/**
 * Admin Routes
 * All routes are prefixed with /api/admin
 */

// Dashboard
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// GET /api/admin/dashboard/analytics
router.get('/dashboard/analytics', getAnalyticsData);

// GET /api/admin/dashboard/recent
router.get('/dashboard/recent', getRecentApplications);

// Professionals Management
// GET /api/admin/professionals?page=1&limit=20&status=pending&serviceCategory=plumbing
router.get('/professionals', getAllProfessionalsForAdmin);

// GET /api/admin/professionals/search?search=ram&status=pending&category=plumbing&area=thamel
router.get('/professionals/search', searchProfessionals);

// GET /api/admin/professionals/pending
router.get('/professionals/pending', getPendingApplications);

// GET /api/admin/professionals/:id
router.get('/professionals/:id', getApplicationDetails);

// Application Management
// PATCH /api/admin/applications/:id/approve
router.patch('/applications/:id/approve', approveProfessional);

// PATCH /api/admin/applications/:id/reject
// Body: { rejectionReason: "reason" }
router.patch('/applications/:id/reject', rejectProfessional);

// Analytics
// GET /api/admin/analytics/categories
router.get('/analytics/categories', getCategoryDistribution);

// GET /api/admin/analytics/status
router.get('/analytics/status', getStatusDistribution);

// Export
// GET /api/admin/export?format=json&status=verified
router.get('/export', exportData);

// Broadcast Notification
// POST /api/admin/broadcast
// Body: { recipient: 'all'|'users'|'professionals', title, message }
router.post('/broadcast', broadcastNotification);

export default router;
