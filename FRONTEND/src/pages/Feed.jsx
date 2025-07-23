import { useSocket } from "../contexts/SocketContext";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommentSection from "../components/commentSection";
import LikeButton from "../components/LikeButton";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import NotificationBar from "../components/notificationBar";
import { postsAPI } from "../utils/api";
import MediaUploader from "../components/MediaUploader";
import config from "../config/environment.js";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);
  const socket = useSocket();

  // Helper function to convert file system paths to proper URLs
  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return '';

    // If it's already a proper URL (starts with http), return as is
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }

    // If it's a relative URL starting with /uploads/, prepend the API base URL
    if (mediaUrl.startsWith('/uploads/')) {
      return `${config.API_BASE_URL}${mediaUrl}`;
    }

    // If it's a local file system path, extract the filename and create proper URL
    if (mediaUrl.includes('\\uploads\\') || mediaUrl.includes('/uploads/')) {
      const filename = mediaUrl.split(/[\\\/]/).pop();
      return `${config.API_BASE_URL}/uploads/${filename}`;
    }

    // Fallback: assume it's just a filename
    return `${config.API_BASE_URL}/uploads/${mediaUrl}`;
  };

  useEffect(() => {
    // Only set up socket listeners if socket is available
    if (!socket) {
      console.warn("Socket not available yet");
      return;
    }

    const handleNewPost = (savedPost) => {
      setPosts((prev) => [savedPost, ...prev]);
    };

    const handlePostDeleted = (deletedPostId) => {
      setPosts((prev) => prev.filter((post) => post._id !== deletedPostId));
    };

    const handlePostLiked = ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, likes } : post))
      );
    };

    const handleNewComment = ({ postId, comment }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );

      const notificationMessage = `💬 New comment by ${comment.username} on a post`;
      setNotifications((prev) => [...prev, notificationMessage]);

      // Remove notification after 3 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n !== notificationMessage)
        );
      }, 3000);
    };

    // Set up socket listeners
    socket.on("newPost", handleNewPost);
    socket.on("postDeleted", handlePostDeleted);
    socket.on("postLiked", handlePostLiked);
    socket.on("newComment", handleNewComment);

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("newPost", handleNewPost);
        socket.off("postDeleted", handlePostDeleted);
        socket.off("postLiked", handlePostLiked);
        socket.off("newComment", handleNewComment);
      }
    };
  }, [socket]); // Add socket as dependency

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts();

      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPost.trim() && selectedMedia.length === 0) {
      setError("Please enter some content or select media for your post.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      let response;
      
      if (selectedMedia.length > 0) {
        // Create FormData for media upload
        const formData = new FormData();
        formData.append('content', newPost);
        
        selectedMedia.forEach((file) => {
          formData.append('media', file);
        });

        response = await fetch(`${postsAPI.baseURL}/api/posts/with-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to create post with media');
        }

        response = await response.json();
      } else {
        // Regular text post
        response = await postsAPI.createPost({ content: newPost });
      }

      setPosts([response.post, ...posts]);
      setNewPost("");
      setSelectedMedia([]);
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <Navbar />
      <NotificationBar notifications={notifications} />
      <div className="p-4 max-w-xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        {/* Post Creator */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            rows={3}
            disabled={posting}
          />
          
          {/* Media Uploader */}
          <div className="mt-3">
            <MediaUploader onMediaSelect={setSelectedMedia} />
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedMedia.length > 0 && `${selectedMedia.length} file(s) selected`}
            </span>
            
            <button
              type="submit"
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-500 disabled:cursor-not-allowed transition-colors"
              disabled={posting || (!newPost.trim() && selectedMedia.length === 0)}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-900 dark:text-white">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No posts yet. Be the first to post!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors"
              >
                {/* Post Header */}
                <div className="flex items-center mb-3">
                  <div className="mr-3">
                    <ZoomableProfilePic
                      profilePic={post.user?.profilepic}
                      username={post.user?.username || "User"}
                      isOwnProfile={false}
                      size="small"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/profile/${post.user?.username}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {post.user?.username || "Unknown User"}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {user && (
                    <LikeButton
                      post={post}
                      userId={user._id}
                      onLike={(newLikes) => {
                        setPosts((prevPosts) =>
                          prevPosts.map((p) =>
                            p._id === post._id ? { ...p, likes: newLikes } : p
                          )
                        );
                      }}
                    />
                  )}
                </div>

                {/* Post Content */}
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {post.content}
                </p>

                {/* Media Display */}
                {post.media && post.media.length > 0 && (
                  <div className={`grid gap-2 mb-3 ${
                    post.media.length === 1 ? 'grid-cols-1' : 
                    post.media.length === 2 ? 'grid-cols-2' : 
                    'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {post.media.map((media, index) => (
                      <div key={index} className="relative">
                        {media.type === 'image' ? (
                          <img
                            src={getMediaUrl(media.url)}
                            alt="Post media"
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(getMediaUrl(media.url), '_blank')}
                          />
                        ) : (
                          <video
                            src={getMediaUrl(media.url)}
                            controls
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Section */}
                <CommentSection postId={post._id} />
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Feed;
