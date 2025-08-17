import React, { useEffect, useState } from 'react';

export default function VersionHistory({ noteId, api, token, onRestore }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    api.get(`/notes/${noteId}/versions`, { headers: { Authorization: token } })
      .then(res => setVersions(res.data));
  }, [noteId, api, token]);

  return (
    <div>
      <h4>Version History</h4>
      <ul>
        {versions.map((ver, idx) => (
          <li key={idx}>
            {new Date(ver.updatedAt).toLocaleString()}
            <button type="button" onClick={() => onRestore(idx)}>Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
}