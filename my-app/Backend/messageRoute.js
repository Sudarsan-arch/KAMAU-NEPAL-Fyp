import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  sendMessage,
  getMyMessages,
  updateMessageStatus,
  deleteMessage,
  getConversations,
  getMessageThread
} from './controllers/messageController.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

// Configure multer for message attachments
const uploadDir = './uploads/messages';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    fieldSize: 50 * 1024 * 1024  // 50MB for field data
  } 
});

// All message routes require authentication
router.use(verifyToken);

// Upload attachment
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.status(200).json({
    success: true,
    data: {
      url: `/uploads/messages/${req.file.filename}`,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    }
  });
});

// Send a message
router.post('/', sendMessage);

// Get all conversations list
router.get('/conversations', getConversations);

// Get message thread with a specific user
router.get('/thread/:otherUserId', getMessageThread);

// Get messages for user (supports query param ?category=inbox|sent|archived|starred)
router.get('/', getMyMessages);

// Update message status
router.patch('/:id', updateMessageStatus);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
