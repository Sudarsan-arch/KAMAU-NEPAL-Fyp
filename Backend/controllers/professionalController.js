import ProfessionalModel from '../models/professionalModel.js';
import fs from 'fs';
import path from 'path';

// Register a new professional service provider
export const registerProfessional = async (req, res) => {
  try {
    console.log('=== Professional Registration Started ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      serviceCategory,
      serviceArea,
      hourlyWage,
      bio
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !phone || !serviceCategory || !serviceArea || !hourlyWage) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided',
        received: { firstName, lastName, username, email, phone, serviceCategory, serviceArea, hourlyWage }
      });
    }

    // Check if email already exists
    const existingEmail = await ProfessionalModel.findOne({ email });
    if (existingEmail) {
      console.log('❌ Email already exists:', email);
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if username already exists
    const existingUsername = await ProfessionalModel.findOne({ username });
    if (existingUsername) {
      console.log('❌ Username already exists:', username);
      return res.status(409).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Handle profile image
    let profileImagePath = null;
    if (req.files && req.files.profileImage) {
      profileImagePath = req.files.profileImage[0].path;
      console.log('✅ Profile image uploaded:', profileImagePath);
    }

    // Handle verification documents
    let documentPaths = [];
    if (req.files && req.files.documents) {
      documentPaths = req.files.documents.map(doc => ({
        filename: doc.filename,
        path: doc.path,
        originalName: doc.originalname,
        mimetype: doc.mimetype,
        size: doc.size
      }));
      console.log('✅ Documents uploaded:', documentPaths.length);
    }

    // Create new professional record
    const newProfessional = new ProfessionalModel({
      firstName,
      lastName,
      username,
      email,
      phone,
      serviceCategory,
      serviceArea,
      hourlyWage: parseFloat(hourlyWage),
      bio: bio || '',
      profileImage: profileImagePath,
      verificationDocuments: documentPaths,
      verificationStatus: 'verified',
      verificationDate: new Date(),
      createdAt: new Date()
    });

    console.log('💾 Saving to database...');
    // Save to database
    await newProfessional.save();
    console.log('✅ Professional saved successfully:', newProfessional._id);

    return res.status(201).json({
      success: true,
      message: 'Professional registration completed successfully!',
      data: {
        id: newProfessional._id,
        username: newProfessional.username,
        email: newProfessional.email,
        verificationStatus: newProfessional.verificationStatus
      }
    });

  } catch (error) {
    console.error('❌ Professional registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Get professional profile by ID
export const getProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findById(id).select('-verificationDocuments');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Error fetching professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get all professionals (with pagination)
export const getAllProfessionals = async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceCategory, serviceArea, verificationStatus = 'verified' } = req.query;

    const query = { verificationStatus };

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    if (serviceArea) {
      query.serviceArea = serviceArea;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .select('-verificationDocuments')
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

// Search professionals by category and area
export const searchProfessionals = async (req, res) => {
  try {
    const { serviceCategory, serviceArea } = req.query;

    const query = { verificationStatus: 'verified' };

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    if (serviceArea) {
      query.serviceArea = serviceArea;
    }

    const professionals = await ProfessionalModel.find(query)
      .select('-verificationDocuments')
      .sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: professionals
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

// Update professional profile
export const updateProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, bio, hourlyWage, serviceArea, phone } = req.body;

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (hourlyWage) updateData.hourlyWage = parseFloat(hourlyWage);
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (phone) updateData.phone = phone;

    // Handle profile image update
    if (req.files && req.files.profileImage) {
      updateData.profileImage = req.files.profileImage[0].path;
    }

    const updatedProfessional = await ProfessionalModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-verificationDocuments');

    if (!updatedProfessional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfessional
    });

  } catch (error) {
    console.error('Error updating professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get pending professional applications (Admin)
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
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Verify professional (Admin)
export const verifyProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const updateData = {
      verificationStatus: status,
      verificationDate: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      updateData,
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
      message: `Professional ${status} successfully`,
      data: professional
    });

  } catch (error) {
    console.error('Error verifying professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// Delete professional profile (Admin or user)
export const deleteProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findByIdAndDelete(id);

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // TODO: Delete associated files from storage
    // if (professional.profileImage) {
    //   fs.unlinkSync(professional.profileImage);
    // }
    // professional.verificationDocuments.forEach(doc => {
    //   fs.unlinkSync(doc.path);
    // });

    return res.status(200).json({
      success: true,
      message: 'Professional profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: error.message
    });
  }
};

// Get professional by username
export const getProfessionalByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const professional = await ProfessionalModel.findOne({ 
      username,
      verificationStatus: 'verified'
    }).select('-verificationDocuments');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Error fetching professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professional',
      error: error.message
    });
  }
};
