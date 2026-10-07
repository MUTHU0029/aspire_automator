const mongoose = require('mongoose');

const gateScoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    test1: { type: Number, min: 0, max: 60, default: 0 },
    test2: { type: Number, min: 0, max: 40, default: 0 },
    test3: { type: Number, min: 0, max: 60, default: 0 },
    test4: { type: Number, min: 0, max: 40, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gateScoreSchema.pre('save', function (next) {
  this.total = Number(this.test1 || 0) + Number(this.test2 || 0) + Number(this.test3 || 0) + Number(this.test4 || 0);
  next();
});

gateScoreSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();
  if (update.test1 !== undefined || update.test2 !== undefined || update.test3 !== undefined || update.test4 !== undefined) {
    const values = {
      test1: Number(update.test1 || 0),
      test2: Number(update.test2 || 0),
      test3: Number(update.test3 || 0),
      test4: Number(update.test4 || 0),
    };
    update.total = values.test1 + values.test2 + values.test3 + values.test4;
  }
  next();
});

module.exports = mongoose.model('GateScore', gateScoreSchema);
