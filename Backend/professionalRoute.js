import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  registerProfessional,
  getProfessionalProfile,
  getAllProfessionals,
  searchProfessionals,
  updateProfessionalProfile,
  getPendingApplications,
  verifyProfessional,
  deleteProfessionalProfile,
  getProfessionalByUsername
} from './controllers/professionalController.js';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = './Backend/uploads/professionals';

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes

// Register a new professional
// POST /api/professionals/register
// Expects: multipart/form-data with profileImage and document_0, document_1, etc.
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), registerProfessional);

// Get all professionals (verified only by default)
// GET /api/professionals?page=1&limit=10&serviceCategory=plumbing&serviceArea=thamel&verificationStatus=verified
router.get('/', getAllProfessionals);

// Search professionals by filters
// GET /api/professionals/search?serviceCategory=plumbing&serviceArea=thamel
router.get('/search', searchProfessionals);

// Get professional by username
// GET /api/professionals/user/:username
router.get('/user/:username', getProfessionalByUsername);

// Get professional profile by ID
// GET /api/professionals/:id
router.get('/:id', getProfessionalProfile);

// Update professional profile
// PUT /api/professionals/:id
// Expects: multipart/form-data (optional profileImage)
router.put('/:id', upload.single('profileImage'), updateProfessionalProfile);

// Delete professional profile
// DELETE /api/professionals/:id
router.delete('/:id', deleteProfessionalProfile);

// Admin routes

// Get pending applications for verification
// GET /api/professionals/admin/pending?page=1&limit=10
router.get('/admin/pending', getPendingApplications);

// Verify or reject professional
// PATCH /api/professionals/admin/verify/:id
// Expects: { status: 'verified' or 'rejected', rejectionReason: 'optional reason' }
router.patch('/admin/verify/:id', verifyProfessional);

export default router;
