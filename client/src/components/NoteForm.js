import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

export default function NoteForm({ onSubmit, initial = {} }) {
  const [title, setTitle] = useState(initial.title || '');
  const [content, setContent] = useState(initial.content || '');
  const [course, setCourse] = useState(initial.course || '');
  const [module, setModule] = useState(initial.module || '');
  const [tags, setTags] = useState(initial.tags ? initial.tags.join(',') : '');
  const [pinned, setPinned] = useState(initial.pinned || false);
  const [reminder, setReminder] = useState(initial.reminder ? initial.reminder.slice(0,16) : '');

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      course,
      module,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      pinned,
      reminder: reminder ? new Date(reminder) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <input placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} />
      <input placeholder="Module" value={module} onChange={e => setModule(e.target.value)} />
      <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <label>
        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} /> Pin
      </label>
      <label>
        Reminder: <input type="datetime-local" value={reminder} onChange={e => setReminder(e.target.value)} />
      </label>
      <RichTextEditor value={content} onChange={setContent} />
      <button type="submit">Save Note</button>
    </form>
  );
}