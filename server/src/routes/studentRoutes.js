const express = require('express');
const upload = require('../config/upload');
const {
  getStudentProfile,
  getStudentDashboard,
  getMyGateScores,
  getMyNptelSubmissions,
  submitNptel,
} = require('../controllers/studentController');
const {
  getMyExaminationAttempts,
  createExaminationAttempt,
  getMyExaminationProof,
} = require('../controllers/examinationController');

const router = express.Router();

router.get('/profile', getStudentProfile);
router.get('/dashboard', getStudentDashboard);
router.get('/gate/my', getMyGateScores);
router.get('/nptel/my', getMyNptelSubmissions);
router.post('/nptel', upload.single('certificate'), submitNptel);
router.get('/examinations/my', getMyExaminationAttempts);
router.post('/examinations', upload.single('proof'), createExaminationAttempt);
router.get('/examinations/:id/proof', getMyExaminationProof);

module.exports = router;
