import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reporterModel'
  },
  reporterModel: {
    type: String,
    required: true,
    enum: ['User', 'Professional']
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['User', 'Professional']
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Inappropriate Behavior',
      'Unprofessional Service',
      'Fraud or Scam',
      'Fake Profile',
      'Late for Work',
      'Poor Quality',
      'Harassment',
      'Payment Issues',
      'Safety Concerns',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  }
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
