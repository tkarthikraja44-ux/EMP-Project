import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    answers: [Number],
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

resultSchema.index({ userId: 1, testId: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
