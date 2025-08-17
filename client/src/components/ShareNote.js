import React, { useState } from 'react';

export default function ShareNote({ noteId, api, token }) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    try {
      await api.post(`/notes/${noteId}/share`, { username }, { headers: { Authorization: token } });
      setMessage('Note shared!');
    } catch (e) {
      setMessage('User not found');
    }
  };

  return (
    <div>
      <input placeholder="Share with username" value={username} onChange={e => setUsername(e.target.value)} />
      <button type="button" onClick={handleShare}>Share</button>
      <span>{message}</span>
    </div>
  );
}