const mongoose = require('mongoose');

const nptelSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: String,
      trim: true,
      default: '',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    certificateFileName: {
      type: String,
      required: true,
    },
    certificatePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    facultyComment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NptelSubmission', nptelSubmissionSchema);
