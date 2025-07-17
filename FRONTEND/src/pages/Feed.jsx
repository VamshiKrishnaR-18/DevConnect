import { useSocket } from "../contexts/SocketContext";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommentSection from "../components/commentSection";
import LikeButton from "../components/LikeButton";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import NotificationBar from "../components/notificationBar";



function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);
  const socket = useSocket();

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
        setNotifications((prev) => prev.filter((n) => n !== notificationMessage));
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
      const response = await axios.get(
  "https://devconnect-f4au.onrender.com/api/posts",
  { withCredentials: true }
);

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

    if (!newPost.trim()) {
      setError("Please enter some content for your post.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
  "https://devconnect-f4au.onrender.com/api/posts",
  { content: newPost },
  {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }
);


      setPosts([response.data.post, ...posts]);
      setNewPost("");
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
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Post Creator */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={posting}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            disabled={posting || !newPost.trim()}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </form>

        {/* Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No posts yet. Be the first to post!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                {/* Post Header with Profile Picture */}
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
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {post.user?.username || "Unknown User"}
                    </Link>
                    <p className="text-sm text-gray-500">
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
                <p className="text-gray-800 mb-2">{post.content}</p>

                {/* 🔽 Comment Section for each post */}
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
