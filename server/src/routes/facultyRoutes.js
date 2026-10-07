const express = require('express');
const {
  getDashboardSummary,
  getStudents,
  getSectionGateEntry,
  saveGateMarks,
  getNptelSubmissions,
  reviewNptelSubmission,
  getCertificate,
} = require('../controllers/facultyController');

const router = express.Router();

router.get('/dashboard', getDashboardSummary);
router.get('/students', getStudents);
router.get('/gate', getSectionGateEntry);
router.post('/gate/bulk', saveGateMarks);
router.get('/nptel', getNptelSubmissions);
router.get('/nptel/:id/certificate', getCertificate);
router.patch('/nptel/:id/review', reviewNptelSubmission);

module.exports = router;
