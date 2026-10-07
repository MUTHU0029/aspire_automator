const express = require('express');
const upload = require('../config/upload');
const {
  getStudentProfile,
  getStudentDashboard,
  getMyGateScores,
  getMyNptelSubmissions,
  submitNptel,
} = require('../controllers/studentController');

const router = express.Router();

router.get('/profile', getStudentProfile);
router.get('/dashboard', getStudentDashboard);
router.get('/gate/my', getMyGateScores);
router.get('/nptel/my', getMyNptelSubmissions);
router.post('/nptel', upload.single('certificate'), submitNptel);

module.exports = router;
