const express = require('express');
const {
  getDashboardSummary,
  getStudents,
  getSectionGateEntry,
  getGateExportData,
  saveGateMarks,
  getNptelSubmissions,
  reviewNptelSubmission,
  getCertificate,
} = require('../controllers/facultyController');
const {
  getFacultyExaminationAttempts,
  getFacultyExaminationProof,
} = require('../controllers/examinationController');

const router = express.Router();

router.get('/dashboard', getDashboardSummary);
router.get('/students', getStudents);
router.get('/gate', getSectionGateEntry);
router.get('/gate/export', getGateExportData);
router.post('/gate/bulk', saveGateMarks);
router.get('/nptel', getNptelSubmissions);
router.get('/nptel/:id/certificate', getCertificate);
router.patch('/nptel/:id/review', reviewNptelSubmission);
router.get('/examinations', getFacultyExaminationAttempts);
router.get('/examinations/:id/proof', getFacultyExaminationProof);

module.exports = router;
