import { useState, useEffect } from "react";
import api from "../utils/api"; 

export default function LikeButton({ post, userId, onLike }) {
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    // Only check for likes if userId is defined
    if (!userId) {
      setHasLiked(false);
      return;
    }

    if (Array.isArray(post.likes)) {
      const isLiked = post.likes.some(like => {
        // Compare the like with userId (handle both object/string cases)
        return like === userId || like?.toString() === userId?.toString();
      });

      setHasLiked(isLiked);
    }
  }, [post.likes, userId]);

  const handleLike = async () => {
    if (!userId) return; 
    
    setLiking(true);
    try {
      // FIX: Use relative path (api util handles base URL) and correct endpoint
      // Route is: PUT /api/posts/:postId/like
      const res = await api.put(`/posts/${post._id}/like`);

      // FIX: Backend returns { data: { likes: [...] } }
      // So we access res.data.data.likes
      if (res.data?.data?.likes) {
        onLike(res.data.data.likes); 
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liking || !userId}
      className={`text-sm transition-colors ${
        hasLiked ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
      } hover:text-blue-600 dark:hover:text-blue-300`}
    >
      {/* Show Heart Icon */}
      {hasLiked ? "❤️" : "🤍"} {Array.isArray(post.likes) ? post.likes.length : 0}
    </button>
  );
}