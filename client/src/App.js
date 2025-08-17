import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', course: '', module: '' });
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);

  useEffect(() => {
    if (token) {
      api.get('/notes', { headers: { Authorization: token } })
        .then(res => setNotes(res.data));
    }
  }, [token]);

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

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/notes', form, { headers: { Authorization: token } });
    setNotes([res.data, ...notes]);
    setForm({ title: '', content: '', course: '', module: '' });
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
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 40 }}>
      <h2>My Course Notes</h2>
      <button onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Logout</button>
      <form onSubmit={handleNoteSubmit}>
        <input placeholder="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
        <input placeholder="Module" value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} />
        <textarea placeholder="Content" required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        <button type="submit">Add Note</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note._id}>
            <b>{note.title}</b> ({note.course} / {note.module})<br />
            <div>{note.content}</div>
            <small>{new Date(note.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;