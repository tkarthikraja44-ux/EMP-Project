import express from 'express';
import { stringify } from 'csv-stringify/sync';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/dashboard', async (_req, res) => {
  const [totalCandidates, totalTests, activeTests, completedTests, top] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    Test.countDocuments(),
    Test.countDocuments({ isActive: true }),
    Result.countDocuments(),
    Result.find().populate('userId', 'name').sort({ percentage: -1 }).limit(5)
  ]);

  res.json({
    totalCandidates,
    totalTests,
    activeTests,
    completedTests,
    leaderboard: top.map((r) => ({ name: r.userId?.name || 'Unknown', percentage: r.percentage, score: r.score }))
  });
});

router.post('/tests', async (req, res) => {
  const test = await Test.create(req.body);
  res.status(201).json(test);
});

router.get('/tests', async (_req, res) => {
  res.json(await Test.find().sort({ createdAt: -1 }));
});

router.put('/tests/:id', async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(test);
});

router.delete('/tests/:id', async (req, res) => {
  await Test.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.patch('/tests/:id/toggle', async (req, res) => {
  const test = await Test.findById(req.params.id);
  test.isActive = !test.isActive;
  await test.save();
  res.json(test);
});

router.get('/results', async (_req, res) => {
  const results = await Result.find().populate('userId', 'name email').populate('testId', 'title').sort({ submittedAt: -1 });
  res.json(results);
});

router.get('/results/export/csv', async (_req, res) => {
  const results = await Result.find().populate('userId', 'name email').populate('testId', 'title');
  const csv = stringify(
    results.map((r) => ({
      candidate: r.userId?.name,
      email: r.userId?.email,
      test: r.testId?.title,
      score: r.score,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
      submittedAt: r.submittedAt
    })),
    { header: true }
  );

  res.header('Content-Type', 'text/csv');
  res.attachment('results.csv');
  res.send(csv);
});

export default router;
