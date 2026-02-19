import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const sign = (user) => jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const role = 'candidate';
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already used' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  res.status(201).json({ token: sign(user), user: { id: user._id, role: user.role, name: user.name } });
});

router.post('/login/:role', async (req, res) => {
  const { email, password } = req.body;
  const role = req.params.role;
  const user = await User.findOne({ email, role });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

  res.json({ token: sign(user), user: { id: user._id, role: user.role, name: user.name, email: user.email, photo: user.photo } });
});

router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: 'If account exists, reset link sent' });
  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  user.resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();
  res.json({ message: 'Reset token generated', token });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ resetToken: token, resetTokenExp: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

export default router;
