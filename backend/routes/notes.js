// ...existing code...
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, upload.single('file'), (req, res) => {
  // Save req.file.filename to note.attachments
  res.json({ filename: req.file.filename });
});

// Search notes by keyword and tags
router.get('/search', auth, async (req, res) => {
  const { q, tags } = req.query;
  let query = { user: req.user };
  if (q) query.content = { $regex: q, $options: 'i' };
  if (tags) query.tags = { $in: tags.split(',') };
  const notes = await Note.find(query).sort({ pinned: -1, createdAt: -1 });
  res.json(notes);
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

// Add note version on update
router.put('/:id', auth, async (req, res) => {
  const { title, content, course, module, tags, pinned } = req.body;
  const note = await Note.findOne({ _id: req.params.id, user: req.user });
  note.versions.push({ content: note.content });
  note.title = title;
  note.content = content;
  note.course = course;
  note.module = module;
  note.tags = tags;
  note.pinned = pinned;
  await note.save();
  res.json(note);
});