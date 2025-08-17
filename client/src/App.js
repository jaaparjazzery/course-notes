import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteForm from './components/NoteForm';
import AttachmentUpload from './components/AttachmentUpload';
import ShareNote from './components/ShareNote';
import VersionHistory from './components/VersionHistory';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = () => {
    if (token) {
      api.get(`/notes/search?q=${search}&tags=${tags}`, { headers: { Authorization: token } })
        .then(res => setNotes(res.data));
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [token, search, tags]);

  const handleLogin = async () => {
    const res = await api.post('/auth/login', auth);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
  };

  const handleRegister = async () => {
    await api.post('/auth/register', auth);
    setRegisterMode(false);
    setAuth({ username: '', password: '' });
  };

  const handleNoteSubmit = async (data) => {
    if (editNote) {
      await api.put(`/notes/${editNote._id}`, data, { headers: { Authorization: token } });
      setEditNote(null);
    } else {
      await api.post('/notes', data, { headers: { Authorization: token } });
    }
    setShowForm(false);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await api.delete(`/notes/${id}`, { headers: { Authorization: token } });
    fetchNotes();
  };

  const handlePin = async (note) => {
    await api.patch(`/notes/${note._id}/pin`, { pinned: !note.pinned }, { headers: { Authorization: token } });
    fetchNotes();
  };

  const handleRestore = async (noteId, idx) => {
    await api.patch(`/notes/${noteId}/restore`, { versionIndex: idx }, { headers: { Authorization: token } });
    fetchNotes();
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}>
        <h2>{registerMode ? 'Register' : 'Login'}</h2>
        <input placeholder="Username" value={auth.username} onChange={e => setAuth({ ...auth, username: e.target.value })} /><br />
        <input placeholder="Password" type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} /><br />
        {registerMode ? (
          <>
            <button onClick={handleRegister}>Register</button>
            <button onClick={() => setRegisterMode(false)}>Back to Login</button>
          </>
        ) : (
          <>
            <button onClick={handleLogin}>Login</button>
            <button onClick={() => setRegisterMode(true)}>Register</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>My Course Notes</h2>
      <button onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Logout</button>
      <div>
        <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <button onClick={() => { setShowForm(true); setEditNote(null); }}>New Note</button>
      </div>
      {showForm && (
        <NoteForm
          onSubmit={handleNoteSubmit}
          initial={editNote || {}}
        />
      )}
      <ul>
        {notes.map(note => (
          <li key={note._id} style={{ border: note.pinned ? '2px solid gold' : '1px solid #ccc', margin: 10, padding: 10 }}>
            <b>{note.title}</b> ({note.course} / {note.module})<br />
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
            <div>
              Tags: {note.tags?.join(', ')}<br />
              Attachments: {note.attachments?.map(f => (
                <a key={f} href={`http://localhost:5000/uploads/${f}`} target="_blank" rel="noopener noreferrer">{f}</a>
              ))}
            </div>
            <small>{new Date(note.createdAt).toLocaleString()}</small>
            <div>
              <button onClick={() => { setEditNote(note); setShowForm(true); }}>Edit</button>
              <button onClick={() => handleDelete(note._id)}>Delete</button>
              <button onClick={() => handlePin(note)}>{note.pinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={() => setSelectedNote(note)}>More...</button>
            </div>
            {selectedNote?._id === note._id && (
              <div>
                <AttachmentUpload noteId={note._id} api={api} token={token} onUploaded={fetchNotes} />
                <ShareNote noteId={note._id} api={api} token={token} />
                <VersionHistory noteId={note._id} api={api} token={token} onRestore={idx => handleRestore(note._id, idx)} />
                <button onClick={() => setSelectedNote(null)}>Close</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;