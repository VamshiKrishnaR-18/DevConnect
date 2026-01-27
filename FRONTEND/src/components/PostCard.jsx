import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LikeButton from "./LikeButton";
import api from "../utils/api";
import { MessageCircle, Send, Trash2 } from "lucide-react"; 
import { getProfileImageSrc } from "../utils/imageUtils";

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.includes("D:/") || url.includes("C:/") || url.includes("\\")) return null;
  if (url.startsWith("http")) return url;
  const API_URL = "http://localhost:3000"; 
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return url;
};

const PostCard = ({ post: initialPost, onDelete, showDelete = false }) => {
  const { user } = useContext(AuthContext);
  
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handleLikeUpdate = (newLikes) => {
    setPost((prev) => ({ ...prev, likes: newLikes }));
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      
      // 👇 FIX 1: Correctly Append the New Comment
      // The backend returns the SINGLE new comment object in res.data.data
      const newComment = res.data.data; 

      setPost((prev) => ({
        ...prev,
        // Safely append new comment to existing array
        comments: [...(prev.comments || []), newComment]
      }));
      
      setCommentText("");
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id); 
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const isOwner = user && (
     (typeof post.user === 'string' && post.user === user._id) ||
     (typeof post.user === 'object' && post.user._id === user._id)
  );

  if (!post) return null;

  return (
    <article className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md mb-6 relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
                {post.createdAt ? new Date(post.createdAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : ""}
            </p>
            </div>
        </div>

        {isOwner && showDelete && (
            <button 
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Delete Post"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-[15px] leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Media Gallery */}
      {post.media && post.media.length > 0 && (
        <div className="mt-2 bg-black/5 dark:bg-black/20">
          {post.media.map((item, idx) => {
            const validUrl = getMediaUrl(item.url);
            if (!validUrl) return null;

            return item.type === "video" ? (
              <video key={idx} src={validUrl} controls className="w-full max-h-[500px] object-contain mx-auto" />
            ) : (
              <img key={idx} src={validUrl} alt="Post content" className="w-full max-h-[500px] object-contain mx-auto" />
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 border-y border-gray-100 dark:border-gray-700/50 mt-3">
        <div className="border-r border-gray-100 dark:border-gray-700/50">
           <LikeButton post={post} userId={user?._id} onLike={handleLikeUpdate} />
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="group flex items-center justify-center py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full"
        >
          <MessageCircle size={24} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      {/* Counts */}
      <div className="px-4 py-2 flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.likes?.length || 0} likes</p>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <button onClick={() => setShowComments(!showComments)} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          {post.comments?.length || 0} comments
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 animate-in fade-in slide-in-from-top-1 border-t border-gray-100 dark:border-gray-700">
          <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
            {post.comments?.map((comment, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {comment.user?.username || "User"}:
                </span>
                
                {/* 👇 FIX 2: Changed from comment.text to comment.content */}
                <p className="text-gray-700 dark:text-gray-300 break-words">
                  {comment.content || comment.text} 
                </p>

              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-center text-xs text-gray-400 py-2">No comments yet</p>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full pl-4 pr-10 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || submittingComment}
              className="absolute right-2 top-2 p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;