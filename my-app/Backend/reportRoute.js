import express from 'express';
import { createReport, getAllReports, updateReportStatus } from './controllers/reportController.js';

const router = express.Router();

// Submit a new report
router.post('/', createReport);

// Get all reports (Admin only)
router.get('/all', getAllReports);

// Update report status (Admin only)
router.patch('/:id/status', updateReportStatus);

export default router;
