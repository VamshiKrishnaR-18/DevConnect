import MediaUploader from './MediaUploader';

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedMedia.length === 0) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      selectedMedia.forEach((file) => {
        formData.append('media', file);
      });

      const endpoint = selectedMedia.length > 0 ? '/api/posts/with-media' : '/api/posts';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        setContent("");
        setSelectedMedia([]);
        // Refresh posts
      }
    } catch (error) {
      console.error('Post creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded-lg resize-none"
        rows="3"
      />
      
      <MediaUploader onMediaSelect={setSelectedMedia} />
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          {selectedMedia.length > 0 && `${selectedMedia.length} file(s) selected`}
        </span>
        
        <button
          type="submit"
          disabled={loading || (!content.trim() && selectedMedia.length === 0)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};