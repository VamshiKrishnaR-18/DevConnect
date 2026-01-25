import { useState } from 'react';
import MediaUploader from './MediaUploader'; // Ensure this component exists
import api from '../utils/api'; // <--- Import the API utility we created

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation: Must have content OR media
    if (!content.trim() && selectedMedia.length === 0) return;

    setLoading(true);
    
    try {
      let response;
      
      // CASE 1: Post with Images/Video
      if (selectedMedia.length > 0) {
        const formData = new FormData();
        formData.append('content', content);
        
        // Append all selected files to 'media' field
        selectedMedia.forEach((file) => {
          formData.append('media', file); // Must match backend: upload.array('media')
        });

        // The 'api' instance handles Cookies automatically
        response = await api.post('/posts/with-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } 
      // CASE 2: Text-only Post
      else {
        response = await api.post('/posts', { content });
      }

      // Success!
      if (response.status === 200 || response.status === 201) {
        console.log("Post created!", response.data);
        setContent("");
        setSelectedMedia([]);
        // Note: The Feed will auto-update via Sockets, so no need to manually reload!
      }

    } catch (err) {
      console.error('Post creation failed:', err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border dark:border-gray-600 rounded-lg resize-none bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          disabled={loading}
        />
        
        <div className="mt-3">
          <MediaUploader onMediaSelect={setSelectedMedia} />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMedia.length > 0 && `${selectedMedia.length} file(s) attached`}
          </span>
          
          <button
            type="submit"
            disabled={loading || (!content.trim() && selectedMedia.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;