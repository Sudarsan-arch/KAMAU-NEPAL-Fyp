import mongoose from 'mongoose';

const professionalSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  serviceCategory: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'carpentry', 'cleaning', 'painting', 'gardening', 'mechanic', 'tutoring'],
  },
  serviceArea: {
    type: String,
    required: true,
    enum: [
      'thamel', 'kathmandu-center', 'patan', 'boudha', 'koteshwor',
      'bhaktapur-center', 'nagarkot', 'changu',
      'pulchowk', 'jawalakhel'
    ]
  },
  hourlyWage: {
    type: Number,
    required: true,
    min: 0
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  verificationDocuments: [{
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
professionalSchema.index({ serviceCategory: 1, serviceArea: 1, verificationStatus: 1 });
professionalSchema.index({ email: 1 });
professionalSchema.index({ username: 1 });

const ProfessionalModel = mongoose.model('Professional', professionalSchema);

export default ProfessionalModel;
