const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  content: String,
  updatedAt: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }, // supports rich text (HTML)
  tags: [{ type: String }],
  attachments: [{ type: String }], // stores file paths or URLs
  pinned: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  versions: [VersionSchema],
  reminder: { type: Date },
  course: { type: String },
  module: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);