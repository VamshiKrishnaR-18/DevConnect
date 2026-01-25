import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { getProfileImageSrc } from "../utils/imageUtils";
import { Heart, MessageCircle, Send, Image as ImageIcon, Loader2 } from "lucide-react";

const Feed = () => {
  const socket = useSocket();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Post Creation State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Comments State
  const [commentText, setCommentText] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);

  /* ===================== FETCH POSTS ===================== */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/posts");
        setPosts(res.data.data || res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Unable to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  /* ===================== SOCKET LISTENER ===================== */
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (event) => {
      const postData = event.data?.post || event.post || event;
      if (postData) setPosts((prev) => [postData, ...prev]);
    };

    socket.on("post:created", handleNewPost);
    return () => socket.off("post:created", handleNewPost);
  }, [socket]);

  /* ===================== ACTIONS ===================== */
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedFile) return;

    setIsPosting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("content", newPostContent);
        formData.append("media", selectedFile);
        await api.post("/posts/with-media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/posts", { content: newPostContent });
      }
      setNewPostContent("");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      setPosts((current) =>
        current.map((p) => {
          if (p._id === postId) {
            const userId = "ME"; // Placeholder for optimistic update
            const isLiked = p.likes.includes(userId);
            return {
              ...p,
              likes: isLiked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId],
            };
          }
          return p;
        })
      );
      
      const res = await api.post(`/posts/${postId}/like`);
      
      setPosts((current) =>
        current.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes || res.data.data.likes } : p
        )
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      setPosts((current) =>
        current.map((p) =>
          p._id === postId ? { ...p, comments: res.data.comments || res.data.data.comments } : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  /* ===================== RENDER ===================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 text-sm">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-12 px-4 transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Create Post Widget */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <form onSubmit={handlePostSubmit}>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                   {/* Optional: Add current user avatar here if available in context */}
                   <img src="/defaultAvatar.svg" alt="" className="w-full h-full object-cover opacity-50" />
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all border-transparent"
                    placeholder="What's on your mind?"
                    rows="2"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors px-3 py-1.5 rounded-lg ${
                      selectedFile 
                        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ImageIcon size={18} />
                    {selectedFile ? "Image Selected" : "Photo/Video"}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isPosting || (!newPostContent.trim() && !selectedFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isPosting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {isPosting ? "Posting" : "Post"}
                </button>
              </div>
            </form>
          </div>

          {/* Empty State */}
          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-blue-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                Be the first to share something with the community!
              </p>
            </div>
          )}

          {/* Posts Feed */}
          {posts.map((post) => (
            <article key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
              
              {/* Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={getProfileImageSrc(post.user?.profilepic || post.user?.profilePic)}
                  alt={post.user?.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700"
                  onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {post.user?.username || "Unknown User"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                       month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : ""}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-2">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Media */}
              {post.media && post.media.length > 0 && (
                <div className="mt-2 bg-black/5 dark:bg-black/20">
                  {post.media.map((item, idx) => {
                    if (item.url && item.url.includes("D:/")) return null;
                    return item.type === "video" ? (
                      <video key={idx} src={item.url} controls className="w-full max-h-[500px] object-contain mx-auto" />
                    ) : (
                      <img key={idx} src={item.url} alt="Post content" className="w-full max-h-[500px] object-contain mx-auto" />
                    );
                  })}
                </div>
              )}

              {/* Stats Bar */}
              <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-gray-700/50">
                <span>{post.likes?.length || 0} Likes</span>
                <span>{post.comments?.length || 0} Comments</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 border-b border-gray-50 dark:border-gray-700/50">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <Heart 
                    size={20} 
                    className={`transition-colors ${
                       // If you had current user ID, you could check includes() here for red fill
                       "text-gray-400 group-hover:text-red-500"
                    }`} 
                  />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-red-500">Like</span>
                </button>
                <button
                  onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}
                  className="flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <MessageCircle size={20} className="text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-500">Comment</span>
                </button>
              </div>

              {/* Comment Section */}
              {activeCommentBox === post._id && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 animate-in fade-in slide-in-from-top-1">
                  <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
                    {post.comments?.map((comment, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {comment.user?.username}:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 break-words">{comment.text}</p>
                      </div>
                    ))}
                    {(!post.comments || post.comments.length === 0) && (
                      <p className="text-center text-xs text-gray-400 py-2">No comments yet</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="w-full pl-4 pr-10 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                      value={commentText[post._id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                    />
                    <button
                      onClick={() => handleCommentSubmit(post._id)}
                      className="absolute right-2 top-2 p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                      disabled={!commentText[post._id]?.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export default Feed;