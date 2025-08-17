const express = require('express');
const multer = require('multer');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Get all notes for user (including shared)
router.get('/', auth, async (req, res) => {
  const notes = await Note.find({
    $or: [
      { user: req.user },
      { sharedWith: req.user }
    ]
  }).sort({ pinned: -1, createdAt: -1 });
  res.json(notes);
});

// Search notes by keyword and tags
router.get('/search', auth, async (req, res) => {
  const { q, tags } = req.query;
  let query = {
    $or: [
      { user: req.user },
      { sharedWith: req.user }
    ]
  };
  if (q) query.content = { $regex: q, $options: 'i' };
  if (tags) query.tags = { $in: tags.split(',') };
  const notes = await Note.find(query).sort({ pinned: -1, createdAt: -1 });
  res.json(notes);
});

// Create note
router.post('/', auth, async (req, res) => {
  const { title, content, course, module, tags, pinned, reminder } = req.body;
  const note = await Note.create({ 
    user: req.user, 
    title, 
    content, 
    course, 
    module, 
    tags, 
    pinned, 
    reminder 
  });
  res.json(note);
});

// Update note and versioning
router.put('/:id', auth, async (req, res) => {
  const { title, content, course, module, tags, pinned, reminder } = req.body;
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  // Save version
  note.versions.push({ content: note.content });
  note.title = title;
  note.content = content;
  note.course = course;
  note.module = module;
  note.tags = tags;
  note.pinned = pinned;
  note.reminder = reminder;
  await note.save();
  res.json(note);
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: 'Note deleted' });
});

// Pin/unpin note
router.patch('/:id/pin', auth, async (req, res) => {
  const { pinned } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    { pinned },
    { new: true }
  );
  res.json(note);
});

// Upload attachment
router.post('/:id/attachment', auth, upload.single('file'), async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  note.attachments.push(req.file.filename);
  await note.save();
  res.json({ filename: req.file.filename });
});

// Get versions
router.get('/:id/versions', auth, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note.versions);
});

// Restore version
router.patch('/:id/restore', auth, async (req, res) => {
  const { versionIndex } = req.body;
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  if (!note || !note.versions[versionIndex]) return res.status(404).json({ error: 'Version not found' });
  note.versions.push({ content: note.content });
  note.content = note.versions[versionIndex].content;
  await note.save();
  res.json(note);
});

// Share note
router.post('/:id/share', auth, async (req, res) => {
  const { username } = req.body;
  const userToShare = await User.findOne({ username });
  if (!userToShare) return res.status(404).json({ error: 'User not found' });
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  if (!note.sharedWith.includes(userToShare._id)) {
    note.sharedWith.push(userToShare._id);
    await note.save();
  }
  res.json({ sharedWith: note.sharedWith });
});

module.exports = router;