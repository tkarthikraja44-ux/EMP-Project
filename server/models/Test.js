import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    numberOfQuestions: { type: Number, required: true },
    scheduledAt: Date,
    isActive: { type: Boolean, default: false },
    questions: [questionSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Test', testSchema);
