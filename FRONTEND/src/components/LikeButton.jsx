import { useState, useEffect } from "react";
import api from "../utils/api"; 
import { Heart } from "lucide-react"; 

export default function LikeButton({ post, userId, onLike }) {
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!userId) {
      setHasLiked(false);
      return;
    }

    if (Array.isArray(post.likes)) {
      const isLiked = post.likes.some(like => {
        return like === userId || like?.toString() === userId?.toString();
      });
      setHasLiked(isLiked);
    }
  }, [post.likes, userId]);

  const handleLike = async (e) => {
    e.stopPropagation(); 
    if (!userId || liking) return; 
    
    setLiking(true);
    try {
      const res = await api.post(`/posts/${post._id}/like`);
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
      // Reduced padding from py-3 to py-2 for a slimmer look
      className="group relative flex items-center justify-center w-full h-full py-2 focus:outline-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
      title="Like"
    >
      <Heart
        size={24} 
        strokeWidth={2}
        className={`transition-all duration-300 transform group-active:scale-75 ${
          hasLiked 
            ? "fill-red-500 text-red-500" 
            : "text-gray-500 dark:text-gray-400 group-hover:text-red-500"
        }`}
      />
    </button>
  );
}