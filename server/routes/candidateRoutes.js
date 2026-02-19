import express from 'express';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import { sendCompletionEmail } from '../utils/mailer.js';

const router = express.Router();

const paginate = (query, page, limit) => query.skip((page - 1) * limit).limit(limit);

router.get('/dashboard', async (req, res) => {
  const userId = req.user.id;
  const [available, upcoming, completed, avgRaw] = await Promise.all([
    Test.countDocuments({ isActive: true }),
    Test.countDocuments({ scheduledAt: { $gt: new Date() }, isActive: true }),
    Result.countDocuments({ userId }),
    Result.aggregate([{ $match: { userId } }, { $group: { _id: null, avg: { $avg: '$percentage' } } }])
  ]);

  res.json({ available, upcoming, completed, averageScore: Number(avgRaw[0]?.avg || 0).toFixed(2) });
});

router.get('/tests', async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const tests = await paginate(Test.find({ isActive: true }).select('-questions.correctAnswer'), page, limit);
  const total = await Test.countDocuments({ isActive: true });
  res.json({ tests, total, page, pages: Math.ceil(total / limit) || 1 });
});

router.get('/tests/:id/start', async (req, res) => {
  const test = await Test.findById(req.params.id).lean();
  if (!test || !test.isActive) return res.status(404).json({ message: 'Test unavailable' });

  const randomizedQuestions = [...test.questions]
    .map((q, originalIndex) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      originalIndex
    }))
    .sort(() => Math.random() - 0.5);

  res.json({ ...test, questions: randomizedQuestions });
});

router.post('/tests/:id/submit', async (req, res) => {
  const { answers = [], timeTaken = 0 } = req.body;
  const test = await Test.findById(req.params.id);
  const user = await User.findById(req.user.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });

  const normalizedAnswers = new Array(test.questions.length).fill(-1);
  answers.forEach((a) => {
    if (Number.isInteger(a?.originalIndex) && Number.isInteger(a?.selectedOption)) {
      normalizedAnswers[a.originalIndex] = a.selectedOption;
    }
  });

  const correct = test.questions.reduce(
    (acc, q, i) => acc + (normalizedAnswers[i] === q.correctAnswer ? 1 : 0),
    0
  );

  const score = Math.round((correct / test.questions.length) * test.totalMarks);
  const percentage = Number(((score / test.totalMarks) * 100).toFixed(2));

  const result = await Result.findOneAndUpdate(
    { userId: req.user.id, testId: test._id },
    {
      userId: req.user.id,
      testId: test._id,
      score,
      percentage,
      timeTaken: Math.max(timeTaken, 0),
      answers: normalizedAnswers,
      submittedAt: new Date()
    },
    { upsert: true, new: true }
  );

  sendCompletionEmail({ to: user.email, name: user.name, title: test.title, score, percentage }).catch(() => null);

  res.json({
    result,
    summary: {
      totalQuestions: test.questions.length,
      correct,
      wrong: test.questions.length - correct,
      pass: percentage >= 40
    }
  });
});

router.get('/history', async (req, res) => {
  const results = await Result.find({ userId: req.user.id }).populate('testId', 'title').sort({ submittedAt: -1 });
  res.json(results);
});

router.get('/analytics', async (req, res) => {
  const results = await Result.find({ userId: req.user.id }).populate('testId', 'title').sort({ percentage: -1 });
  const topPercentage = results[0]?.percentage || 0;
  const rank = (await Result.countDocuments({ percentage: { $gt: topPercentage } })) + 1;

  res.json({
    rank,
    bar: results.map((r) => ({ name: r.testId?.title, percentage: r.percentage })),
    pie: {
      passed: results.filter((r) => r.percentage >= 40).length,
      failed: results.filter((r) => r.percentage < 40).length
    }
  });
});

export default router;
