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
        const res = await axios.get(`/api/comments/${postId}`);
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
        "/api/comments",
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
      await axios.delete(`/api/comments/${commentId}`, {
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
    <div className="p-3 border-t mt-4">
      <h4 className="font-semibold mb-2">Comments</h4>
      {/* Input Field */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Post
        </button>
      </div>
      {/* Loading State */}
      {loading ? (
        <p className="text-black">Loading comments...</p>
      ) : !Array.isArray(comments) || comments.length === 0 ? (
        <p className="text-black">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id || comment.id} className="mb-2 p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <Link
                to={`/profile/${comment.userId?.username}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {comment.userId?.username}
              </Link>
              {comment.userId?._id === getUserIdFromToken(token) && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm">{comment.text}</p>
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