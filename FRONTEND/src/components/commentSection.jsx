import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContextStore"; // ADD: Import socket hook

export default function CommentSection({ postId }) {
  const { user } = useContext(AuthContext);
  const socket = useSocket(); // ADD: Get socket instance

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH COMMENTS ===================== */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/${postId}`);
        // FIX: Backend returns { data: { comments: [...] } }
        setComments(res.data.data?.comments || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchComments();
  }, [postId]);

  /* ===================== REAL-TIME SOCKETS ===================== */
  useEffect(() => {
    if (!socket || !postId) return;

    // Handle new comment coming from others
    const handleNewComment = ({ postId: eventPostId, comment }) => {
      if (eventPostId === postId) {
        setComments((prev) => [comment, ...prev]);
      }
    };

    // Handle comment deletion
    const handleCommentDeleted = ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    // Listen to events
    socket.on("comment:created", handleNewComment);
    socket.on("commentDeleted", handleCommentDeleted); // Note: Backend uses this specific string for delete

    return () => {
      socket.off("comment:created", handleNewComment);
      socket.off("commentDeleted", handleCommentDeleted);
    };
  }, [socket, postId]);

  /* ===================== ADD COMMENT ===================== */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return console.error("User not logged in");

    try {
      const res = await api.post("/comments", {
        postId,
        text: newComment,
      });

      // FIX: Check res.data.data.comment
      if (res.data?.data?.comment) {
        // We don't manually add it here if socket is working, 
        // but it's safe to keep or rely on socket. 
        // Ideally, rely on socket to avoid duplicates, OR check ID.
        // For simplicity, we'll let the socket update the UI to ensure sync.
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  /* ===================== DELETE COMMENT ===================== */
  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      // Optimistic update (removed immediately)
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="p-3 border-t dark:border-gray-600 mt-4">
      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
        Comments
      </h4>

      {/* Add Comment */}
      {user && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading comments...</p>}

      {/* Empty */}
      {!loading && comments.length === 0 && (
        <p className="text-gray-500">No comments yet.</p>
      )}

      {/* Comments */}
      {!loading &&
        comments.map((comment) => (
          <div
            key={comment._id}
            className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <div className="flex justify-between items-center">
              <Link
                to={`/profile/${comment.userId?.username}`}
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                {comment.userId?.username}
              </Link>

              {user?._id === comment.userId?._id && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-500 text-xs hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>

            <p className="text-sm text-gray-800 dark:text-gray-200">
              {comment.text}
            </p>
          </div>
        ))}
    </div>
  );
}