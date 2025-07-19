import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // 🧠 Fetch comments for this post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`https://devconnect-f4au.onrender.com/api/comments/${postId}`);
        
        setComments(res.data.comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  // 🧠 Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const res = await axios.post(
  "https://devconnect-f4au.onrender.com/api/comments",
        { postId, text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Backend returns { message, comment }, so we need res.data.comment
      if (res.data && res.data.comment) {
        setComments([res.data.comment, ...(Array.isArray(comments) ? comments : [])]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
      }
    }
  };

  // 🧠 Delete comment
  const handleDelete = async (commentId) => {
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      await axios.delete(`https://devconnect-f4au.onrender.com/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
      }
    }
  };

  return (
    <div className="p-3 border-t dark:border-gray-600 mt-4">
      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Comments</h4>
      {/* Input Field */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Post
        </button>
      </div>
      {/* Loading State */}
      {loading ? (
        <p className="text-gray-900 dark:text-white">Loading comments...</p>
      ) : !Array.isArray(comments) || comments.length === 0 ? (
        <p className="text-gray-900 dark:text-white">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id || comment.id} className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex justify-between items-center">
              <Link
                to={`/profile/${comment.userId?.username}`}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {comment.userId?.username}
              </Link>
              {comment.userId?._id === getUserIdFromToken(token) && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-500 dark:text-red-400 text-xs hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
          </div>
        ))
      )}
    </div>
  );
}

// Helper to decode userId from token (for delete checks)
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id;
  } catch {
    return null;
  }
}
