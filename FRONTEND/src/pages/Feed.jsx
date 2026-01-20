import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../contexts/SocketContextStore";
import { AuthContext } from "../contexts/AuthContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommentSection from "../components/commentSection";
import LikeButton from "../components/LikeButton";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import NotificationBar from "../components/notificationBar";
import MediaUploader from "../components/MediaUploader";

import api from "../utils/api";
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

  /* -----------------------------
     Media URL helper
  ----------------------------- */
  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return "";
    if (mediaUrl.startsWith("http")) return mediaUrl;
    return `${config.API_BASE_URL}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
  };

  /* -----------------------------
     Fetch posts (DEDUPED)
  ----------------------------- */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/posts");

      const uniquePosts = Array.from(
        new Map((res.data.posts || []).map((p) => [p._id, p])).values()
      );

      setPosts(uniquePosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* -----------------------------
     Socket listeners (DEDUPED)
  ----------------------------- */
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (post) => {
      setPosts((prev) => {
        if (prev.some((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    };

    const handlePostDeleted = (postId) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    const handlePostLiked = ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    };

    const handleNewComment = ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );

      const msg = `New comment by ${comment.username}`;
      setNotifications((prev) => [...prev, msg]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n !== msg));
      }, 3000);
    };

    socket.on("newPost", handleNewPost);
    socket.on("postDeleted", handlePostDeleted);
    socket.on("postLiked", handlePostLiked);
    socket.on("newComment", handleNewComment);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("postDeleted", handlePostDeleted);
      socket.off("postLiked", handlePostLiked);
      socket.off("newComment", handleNewComment);
    };
  }, [socket]);

  /* -----------------------------
     Create post
  ----------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPost.trim() && selectedMedia.length === 0) {
      setError("Please enter content or select media.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      let res;

      if (selectedMedia.length > 0) {
        const formData = new FormData();
        formData.append("content", newPost);
        selectedMedia.forEach((file) => formData.append("media", file));

        res = await api.post("/api/posts/with-media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/api/posts", { content: newPost });
      }

      setPosts((prev) => {
        if (prev.some((p) => p._id === res.data.post._id)) return prev;
        return [res.data.post, ...prev];
      });

      setNewPost("");
      setSelectedMedia([]);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    } finally {
      setPosting(false);
    }
  };

  /* -----------------------------
     Render
  ----------------------------- */
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

        {/* Create Post */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded resize-none"
            rows={3}
            disabled={posting}
          />

          <div className="mt-3">
            <MediaUploader onMediaSelect={setSelectedMedia} />
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              {selectedMedia.length > 0 &&
                `${selectedMedia.length} file(s) selected`}
            </span>

            <button
              type="submit"
              disabled={posting}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* Feed */}
        {loading ? (
          <p className="text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-4 border rounded bg-white shadow-sm"
              >
                <div className="flex items-center mb-3">
                  <ZoomableProfilePic
                    profilePic={post.user?.profilepic}
                    username={post.user?.username}
                    size="small"
                  />

                  <div className="ml-3 flex-1">
                    <Link
                      to={`/profile/${post.user?.username}`}
                      className="font-medium"
                    >
                      {post.user?.username}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {user && <LikeButton post={post} userId={user._id} />}
                </div>

                <p className="mb-3">{post.content}</p>

                {post.media?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {post.media.map((m, i) =>
                      m.type === "image" ? (
                        <img
                          key={`${post._id}-img-${i}`}
                          src={getMediaUrl(m.url)}
                          alt="media"
                          className="rounded object-cover h-40"
                        />
                      ) : (
                        <video
                          key={`${post._id}-vid-${i}`}
                          src={getMediaUrl(m.url)}
                          controls
                          className="rounded h-40"
                        />
                      )
                    )}
                  </div>
                )}

                <CommentSection postId={post._id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Feed;
