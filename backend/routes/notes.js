const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all notes for user
router.get('/', auth, async (req, res) => {
  const notes = await Note.find({ user: req.user }).sort({ createdAt: -1 });
  res.json(notes);
});

// Create note
router.post('/', auth, async (req, res) => {
  const { title, content, course, module } = req.body;
  const note = await Note.create({ user: req.user, title, content, course, module });
  res.json(note);
});

// Update note
router.put('/:id', auth, async (req, res) => {
  const { title, content, course, module } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    { title, content, course, module },
    { new: true }
  );
  res.json(note);
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: 'Note deleted' });
});

module.exports = router;