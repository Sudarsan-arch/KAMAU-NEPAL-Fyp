import Report from '../models/reportModel.js';

export const createReport = async (req, res) => {
  try {
    const { 
      reporter, 
      reporterModel, 
      target, 
      targetModel, 
      reason, 
      description 
    } = req.body;

    if (!reporter || !reporterModel || !target || !targetModel || !reason || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newReport = new Report({
      reporter,
      reporterModel,
      target,
      targetModel,
      reason,
      description
    });

    await newReport.save();
    res.status(201).json({ message: 'Report submitted successfully. Admin will review it.', report: newReport });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter')
      .populate('target')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status, 
        adminNotes,
        resolvedAt: status !== 'Pending' ? new Date() : undefined
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error while updating report' });
  }
};
