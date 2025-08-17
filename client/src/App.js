// ...existing code...
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function App() {
  // ...existing state...
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  // ...existing effect...

  // Add search and tag filter
  useEffect(() => {
    if (token) {
      api.get(`/notes/search?q=${search}&tags=${tags.join(',')}`, { headers: { Authorization: token } })
        .then(res => setNotes(res.data));
    }
  }, [token, search, tags]);

  // ...existing code...
  <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
  <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value.split(',') })} />
  <ReactQuill value={form.content} onChange={val => setForm({ ...form, content: val })} />
  // Add pin button
  <button onClick={() => api.patch(`/notes/${note._id}/pin`, { pinned: !note.pinned }, { headers: { Authorization: token } })}>
    {note.pinned ? 'Unpin' : 'Pin'}
  </button>
  // Show attachments, tags, etc.
}