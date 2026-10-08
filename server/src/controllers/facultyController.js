const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const GateScore = require('../models/GateScore');
const NptelSubmission = require('../models/NptelSubmission');

const getDashboardSummary = async (req, res) => {
  try {
    const [totalStudents, gateTestsCompleted, pendingNptel, approvedNptel, rejectedNptel] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      GateScore.countDocuments(),
      NptelSubmission.countDocuments({ status: 'pending' }),
      NptelSubmission.countDocuments({ status: 'approved' }),
      NptelSubmission.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      totalStudents,
      gateTestsCompleted,
      pendingNptel,
      approvedNptel,
      rejectedNptel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load faculty summary', error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const { department, year, section, search } = req.query;
    const filter = { role: 'student' };

    if (department) filter.department = department;
    if (year) filter.year = year;
    if (section) filter.section = section;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load students', error: error.message });
  }
};

const getSectionGateEntry = async (req, res) => {
  try {
    const { department, year, section } = req.query;

    if (!department || !year || !section) {
      return res.status(400).json({ message: 'Department, year and section are required' });
    }

    const students = await User.find({
      role: 'student',
      department,
      year,
      section,
    }).select('-password').sort({ name: 1 });

    const studentIds = students.map((student) => student._id);
    const gateScores = await GateScore.find({ student: { $in: studentIds } });
    const scoresMap = Object.fromEntries(gateScores.map((score) => [score.student.toString(), score.toObject()]));

    const payload = students.map((student) => ({
      ...student.toObject(),
      gateScore: scoresMap[student._id.toString()] || null,
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load gate entries', error: error.message });
  }
};

const getGateExportData = async (_req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name registerNumber department year')
      .sort({ name: 1 })
      .lean();
    const studentIds = students.map((student) => student._id);
    const gateScores = await GateScore.find({ student: { $in: studentIds } })
      .select('student test1 test2 test3 test4')
      .lean();
    const scoresByStudent = new Map(
      gateScores.map((score) => [score.student.toString(), score])
    );
    const testFields = ['test1', 'test2', 'test3', 'test4'];

    const studentRows = students.map((student) => {
      const score = scoresByStudent.get(student._id.toString());
      return {
        name: student.name,
        registerNumber: student.registerNumber || '',
        department: student.department || '',
        year: student.year || '',
        test1: score ? score.test1 : null,
        test2: score ? score.test2 : null,
        test3: score ? score.test3 : null,
        test4: score ? score.test4 : null,
      };
    });

    const summary = testFields.map((field, index) => {
      const scores = gateScores.map((score) => score[field]).filter(Number.isFinite);
      const total = scores.reduce((sum, score) => sum + score, 0);
      return {
        test: `Test ${index + 1}`,
        highest: scores.length ? scores.reduce((highest, score) => Math.max(highest, score)) : null,
        minimum: scores.length ? scores.reduce((minimum, score) => Math.min(minimum, score)) : null,
        average: scores.length
          ? Number((total / scores.length).toFixed(2))
          : null,
      };
    });

    res.json({ students: studentRows, summary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to prepare GATE score export', error: error.message });
  }
};

const saveGateMarks = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No student marks were provided' });
    }

    const maxMarks = {
      test1: 60,
      test2: 40,
      test3: 60,
      test4: 40,
    };

    for (const record of records) {
      const studentId = record.studentId;
      const student = await User.findById(studentId);

      if (!student || student.role !== 'student') {
        return res.status(404).json({ message: `Student not found for record ${studentId}` });
      }

      for (const field of ['test1', 'test2', 'test3', 'test4']) {
        const value = Number(record[field]);
        if (Number.isNaN(value) || value < 0 || value > maxMarks[field]) {
          return res.status(400).json({ message: `${field.toUpperCase()} must be between 0 and ${maxMarks[field]}` });
        }
      }

      const payload = {
        student: student._id,
        test1: Number(record.test1),
        test2: Number(record.test2),
        test3: Number(record.test3),
        test4: Number(record.test4),
      };

      const existing = await GateScore.findOne({ student: student._id });
      if (existing) {
        existing.test1 = payload.test1;
        existing.test2 = payload.test2;
        existing.test3 = payload.test3;
        existing.test4 = payload.test4;
        await existing.save();
      } else {
        await GateScore.create(payload);
      }
    }

    res.status(200).json({ message: 'Saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save GATE marks', error: error.message });
  }
};

const getNptelSubmissions = async (req, res) => {
  try {
    const { department, year, section, status } = req.query;
    const studentFilter = { role: 'student' };

    if (department) studentFilter.department = department;
    if (year) studentFilter.year = year;
    if (section) studentFilter.section = section;

    const students = await User.find(studentFilter).select('_id name registerNumber department year section');
    const studentIds = students.map((student) => student._id);

    const query = { student: { $in: studentIds } };
    const normalizedStatus = status && status !== 'all' ? status : null;
    if (normalizedStatus) query.status = normalizedStatus;

    const submissions = await NptelSubmission.find(query)
      .populate('student', 'name registerNumber department year section email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load NPTEL submissions', error: error.message });
  }
};

const reviewNptelSubmission = async (req, res) => {
  try {
    const { decision, reason } = req.body;
    const submission = await NptelSubmission.findById(req.params.id).populate('student');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (decision === 'rejected') {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      submission.status = 'rejected';
      submission.facultyComment = reason.trim();
    } else if (decision === 'approved') {
      submission.status = 'approved';
      submission.facultyComment = '';
    } else {
      return res.status(400).json({ message: 'Decision must be approved or rejected' });
    }

    await submission.save();
    res.json({ message: decision === 'approved' ? 'Submission approved' : 'Submission rejected', submission });
  } catch (error) {
    res.status(500).json({ message: 'Failed to review NPTEL submission', error: error.message });
  }
};

const getCertificate = async (req, res) => {
  try {
    const submission = await NptelSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const rawCertificatePath = submission.certificatePath || '';
    const fallbackFilePath = rawCertificatePath.startsWith('uploads/')
      ? path.join(__dirname, '../../', rawCertificatePath)
      : rawCertificatePath;
    const filePath = path.isAbsolute(fallbackFilePath)
      ? fallbackFilePath
      : path.resolve(fallbackFilePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file missing' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${submission.certificateFileName || 'certificate.pdf'}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Failed to open certificate', error: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getStudents,
  getSectionGateEntry,
  getGateExportData,
  saveGateMarks,
  getNptelSubmissions,
  reviewNptelSubmission,
  getCertificate,
};
