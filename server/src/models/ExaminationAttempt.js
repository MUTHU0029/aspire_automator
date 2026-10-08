const mongoose = require('mongoose');

const examinationAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: String,
      enum: ['TNPSC', 'TANCET', 'GRE'],
      required: true,
    },
    appeared: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      required: function scoreRequired() {
        return this.appeared;
      },
    },
    proofFileName: {
      type: String,
      required: function proofRequired() {
        return this.appeared;
      },
    },
    proofPath: {
      type: String,
      required: function proofPathRequired() {
        return this.appeared;
      },
    },
    outcome: {
      type: String,
      enum: ['pending', 'masters_joined', 'post_selected'],
      required: function outcomeRequired() {
        return this.appeared;
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, record) {
        delete record.proofPath;
        return record;
      },
    },
  }
);

examinationAttemptSchema.index({ student: 1, exam: 1, createdAt: -1 });

module.exports = mongoose.model('ExaminationAttempt', examinationAttemptSchema);
