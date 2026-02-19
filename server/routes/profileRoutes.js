import express from 'express';
import multer from 'multer';
import User from '../models/User.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.put('/', upload.single('photo'), async (req, res) => {
  const data = { name: req.body.name, bio: req.body.bio };
  if (req.file) data.photo = `/${req.file.path}`;
  const user = await User.findByIdAndUpdate(req.user.id, data, { new: true }).select('-password');
  res.json(user);
});

export default router;
