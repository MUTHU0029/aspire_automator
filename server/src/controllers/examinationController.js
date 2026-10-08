const fs = require('fs');
const path = require('path');
const ExaminationAttempt = require('../models/ExaminationAttempt');
const User = require('../models/User');

const exams = ['TNPSC', 'TANCET', 'GRE'];
const outcomesByExam = {
  TNPSC: ['pending', 'post_selected'],
  TANCET: ['pending', 'masters_joined'],
  GRE: ['pending', 'masters_joined'],
};

const removeUploadedProof = (file) => {
  if (!file?.path) return;

  try {
    fs.unlinkSync(file.path);
  } catch (error) {
    console.error('Failed to remove invalid examination proof', error);
  }
};

const getMyExaminationAttempts = async (req, res) => {
  try {
    const attempts = await ExaminationAttempt.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load examination records', error: error.message });
  }
};

const createExaminationAttempt = async (req, res) => {
  try {
    const exam = String(req.body.exam || '').toUpperCase();
    const appeared = req.body.appeared;

    if (!exams.includes(exam)) {
      removeUploadedProof(req.file);
      return res.status(400).json({ message: 'Select TNPSC, TANCET or GRE' });
    }

    if (!['true', 'false', true, false].includes(appeared)) {
      removeUploadedProof(req.file);
      return res.status(400).json({ message: 'Specify whether you appeared for the exam' });
    }

    const hasAppeared = appeared === true || appeared === 'true';
    if (!hasAppeared) {
      removeUploadedProof(req.file);
      const attempt = await ExaminationAttempt.create({
        student: req.user._id,
        exam,
        appeared: false,
      });
      return res.status(201).json({ message: 'Examination attempt recorded', attempt });
    }

    const score = Number(req.body.score);
    if (!Number.isFinite(score) || score < 0) {
      removeUploadedProof(req.file);
      return res.status(400).json({ message: 'Enter a valid score of 0 or higher' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF proof is required for an appeared exam' });
    }

    const outcome = String(req.body.outcome || '');
    if (!outcomesByExam[exam].includes(outcome)) {
      removeUploadedProof(req.file);
      return res.status(400).json({ message: 'Select a valid outcome for this examination' });
    }

    const attempt = await ExaminationAttempt.create({
      student: req.user._id,
      exam,
      appeared: true,
      score,
      proofFileName: req.file.originalname,
      proofPath: req.file.path,
      outcome,
    });

    res.status(201).json({ message: 'Examination attempt recorded', attempt });
  } catch (error) {
    removeUploadedProof(req.file);
    res.status(500).json({ message: 'Failed to record examination attempt', error: error.message });
  }
};

const sendAttemptProof = async (attempt, res) => {
  if (!attempt.appeared || !attempt.proofPath) {
    return res.status(404).json({ message: 'No proof was uploaded for this attempt' });
  }

  if (!fs.existsSync(attempt.proofPath)) {
    return res.status(404).json({ message: 'Examination proof file is missing' });
  }

  const fileName = path.basename(attempt.proofFileName || 'examination-proof.pdf').replace(/["\r\n]/g, '');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  return res.sendFile(path.resolve(attempt.proofPath));
};

const getMyExaminationProof = async (req, res) => {
  try {
    const attempt = await ExaminationAttempt.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Examination attempt not found' });
    }

    return sendAttemptProof(attempt, res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to open examination proof', error: error.message });
  }
};

const getFacultyExaminationAttempts = async (req, res) => {
  try {
    const { exam, department, year, section } = req.query;
    const studentFilter = { role: 'student' };
    if (department) studentFilter.department = department;
    if (year) studentFilter.year = year;
    if (section) studentFilter.section = section;

    const students = await User.find(studentFilter).select('_id');
    const query = { student: { $in: students.map((student) => student._id) } };
    if (exam && exam !== 'all') {
      if (!exams.includes(exam)) {
        return res.status(400).json({ message: 'Invalid examination filter' });
      }
      query.exam = exam;
    }

    const attempts = await ExaminationAttempt.find(query)
      .populate('student', 'name registerNumber department year section')
      .sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load examination records', error: error.message });
  }
};

const getFacultyExaminationProof = async (req, res) => {
  try {
    const attempt = await ExaminationAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({ message: 'Examination attempt not found' });
    }

    return sendAttemptProof(attempt, res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to open examination proof', error: error.message });
  }
};

module.exports = {
  getMyExaminationAttempts,
  createExaminationAttempt,
  getMyExaminationProof,
  getFacultyExaminationAttempts,
  getFacultyExaminationProof,
};
