import { useState, useEffect } from "react";
import axios from "axios";

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
        // Compare the like with userId
        return like === userId || like?.toString() === userId?.toString();
      });

      setHasLiked(isLiked);
    }
  }, [post.likes, userId]);

  const handleLike = async () => {
    if (!userId) return; // Don't proceed if userId is undefined
    
    setLiking(true);
    try {
      const res = await axios.put(
  `https://devconnect-f4au.onrender.com/api/likes/${post._id}`,
  {},
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      onLike(res.data.likes); // Updated like array
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
      className={`text-sm transition-colors ${hasLiked ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"} hover:text-blue-600 dark:hover:text-blue-300`}
    >
      {hasLiked ? "❤️" : "🤍"} {Array.isArray(post.likes) ? post.likes.length : 0}
    </button>
  );
}
