const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const GateScore = require('../models/GateScore');
const NptelSubmission = require('../models/NptelSubmission');

const getStudentProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
};

const normalizeGateScore = (gateScore) => {
  if (!gateScore) {
    return { test1: 0, test2: 0, test3: 0, test4: 0, total: 0 };
  }

  const values = {
    test1: Number(gateScore.test1 || 0),
    test2: Number(gateScore.test2 || 0),
    test3: Number(gateScore.test3 || 0),
    test4: Number(gateScore.test4 || 0),
  };

  return {
    ...gateScore.toObject ? gateScore.toObject() : gateScore,
    ...values,
    total: values.test1 + values.test2 + values.test3 + values.test4,
  };
};

const getStudentDashboard = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const gateScore = await GateScore.findOne({ student: req.user._id });
  const latestSubmission = await NptelSubmission.findOne({ student: req.user._id }).sort({ createdAt: -1 });

  res.json({
    user,
    gateScore: normalizeGateScore(gateScore),
    latestSubmission,
  });
};

const getMyGateScores = async (req, res) => {
  const gateScore = await GateScore.findOne({ student: req.user._id });
  res.json({ gateScore: normalizeGateScore(gateScore) });
};

const getMyNptelSubmissions = async (req, res) => {
  const submissions = await NptelSubmission.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json({ submissions });
};

const submitNptel = async (req, res) => {
  try {
    const { courseName, courseId, score } = req.body;

    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    const numericScore = Number(score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Certificate upload is required' });
    }

    if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Invalid certificate format. Only PDF files are allowed.' });
    }

    const certificatePath = req.file.path;
    const submission = await NptelSubmission.create({
      student: req.user._id,
      courseName: courseName.trim(),
      courseId: courseId ? courseId.trim() : '',
      score: numericScore,
      certificateFileName: req.file.originalname,
      certificatePath,
      status: 'pending',
      facultyComment: '',
    });

    res.status(201).json({
      message: 'NPTEL submission uploaded successfully',
      submission,
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file after failed submission', unlinkError);
      }
    }

    res.status(500).json({ message: 'NPTEL submission failed', error: error.message });
  }
};

module.exports = {
  getStudentProfile,
  getStudentDashboard,
  getMyGateScores,
  getMyNptelSubmissions,
  submitNptel,
};
