import React, { useRef } from 'react';

export default function AttachmentUpload({ noteId, api, token, onUploaded }) {
  const fileRef = useRef();

  const handleUpload = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    const res = await api.post(`/notes/${noteId}/attachment`, data, {
      headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
    });
    onUploaded(res.data.filename);
  };

  return (
    <div>
      <input type="file" ref={fileRef} />
      <button type="button" onClick={handleUpload}>Upload Attachment</button>
    </div>
  );
}