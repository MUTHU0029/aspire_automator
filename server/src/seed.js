require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const GateScore = require('./models/GateScore');
const NptelSubmission = require('./models/NptelSubmission');

const facultyData = {
  name: 'Faculty Member',
  email: 'faculty@college.edu',
  password: 'Faculty@123',
  role: 'faculty',
  department: 'ECE',
};

const departments = ['CSE', 'ECE', 'EEE', 'MECH'];
const years = ['II', 'III', 'IV'];
const sections = ['A', 'B'];
const courseCatalog = [
  { name: 'Python for Everybody', courseId: 'NPTEL-PY-101', score: 84 },
  { name: 'Data Structures and Algorithms', courseId: 'NPTEL-DSA-202', score: 76 },
  { name: 'Introduction to IoT', courseId: 'NPTEL-IOT-303', score: 92 },
  { name: 'Digital Signal Processing', courseId: 'NPTEL-DSP-404', score: 80 },
  { name: 'Engineering Thermodynamics', courseId: 'NPTEL-THERMO-505', score: 68 },
];
const statusCycle = ['pending', 'approved', 'rejected'];

const sampleStudents = [];

departments.forEach((department, departmentIndex) => {
  for (let i = 1; i <= 5; i += 1) {
    const year = years[(i - 1) % years.length];
    const section = sections[(departmentIndex + i) % sections.length];
    const registerNumber = `${String(22 + departmentIndex)}${department}${String(i).padStart(2, '0')}`;

    sampleStudents.push({
      name: `${department} Student ${i}`,
      email: `${department.toLowerCase()}student${i}@college.edu`,
      password: 'Student@123',
      role: 'student',
      registerNumber,
      department,
      year,
      section,
    });
  }
});

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const shouldReset = process.env.RESET_DB === 'true';
    const existingUsers = await User.countDocuments();

    if (!shouldReset && existingUsers > 0) {
      console.log('Users already exist. Skipping seed. Use RESET_DB=true to reseed.');
      return true;
    }

    await User.deleteMany({});
    await GateScore.deleteMany({});
    await NptelSubmission.deleteMany({});

    const faculty = await User.create(facultyData);
    const students = await User.create(sampleStudents);

    const gateRecords = students.map((student, index) => ({
      student: student._id,
      test1: 24 + ((index * 7) % 28),
      test2: 10 + ((index * 11) % 18),
      test3: 28 + ((index * 5) % 22),
      test4: 12 + ((index * 9) % 19),
    }));

    await GateScore.insertMany(gateRecords);

    const nptelRecords = students.map((student, index) => {
      const course = courseCatalog[index % courseCatalog.length];
      const status = statusCycle[index % statusCycle.length];

      return {
        student: student._id,
        courseName: course.name,
        courseId: course.courseId,
        score: course.score + (index % 5),
        certificateFileName: `${student.registerNumber}-${course.courseId}.pdf`,
        certificatePath: path.join(__dirname, '../uploads/certificates', `${student.registerNumber}-${course.courseId}.pdf`),
        status,
        facultyComment: status === 'rejected' ? 'Certificate image is unclear and needs correction.' : '',
      };
    });

    await NptelSubmission.insertMany(nptelRecords);

    console.log('Seed data created successfully');
    console.log('Faculty login:', faculty.email, 'Password:', 'Faculty@123');
    console.log('Sample student login:', students[0].email, 'Password:', 'Student@123');
    console.log(`Total students seeded: ${students.length}`);
    return true;
  } catch (error) {
    console.error('Seeding failed:', error.message);
    return false;
  }
};

if (require.main === module) {
  seedDatabase().then((result) => {
    process.exit(result ? 0 : 1);
  });
}

module.exports = { seedDatabase };
