import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { Loader2, Send, Image as ImageIcon, MessageCircle } from "lucide-react";
// 1. Import the new hook (Ensure you installed @tanstack/react-query)
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const Feed = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Post Creation State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  /* ===================== REACT QUERY: INFINITE SCROLL ===================== */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      // Fetch specifically page X with limit 10
      const res = await api.get(`/posts?page=${pageParam}&limit=10`);
      return res.data.data; // This is the { posts: [...], pagination: {...} } object
    },
    getNextPageParam: (lastPage) => {
      // Calculate the next page number from the backend response
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  // Flatten the "pages" of data into one single list of posts
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  /* ===================== SOCKET LISTENER ===================== */
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (event) => {
      const postData = event.data?.post || event.post || event;
      if (postData) {
        // Manually update the React Query cache to show new post immediately
        queryClient.setQueryData(["posts"], (oldData) => {
          if (!oldData) return oldData;
          // Add the new post to the beginning of the first page
          const firstPage = oldData.pages[0];
          const updatedFirstPage = {
            ...firstPage,
            posts: [postData, ...firstPage.posts]
          };
          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)]
          };
        });
      }
    };

    socket.on("post:created", handleNewPost);
    return () => socket.off("post:created", handleNewPost);
  }, [socket, queryClient]);

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

  /* ===================== RENDER ===================== */
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-500">Error loading feed: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-12 px-4 transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Create Post Widget */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <form onSubmit={handlePostSubmit}>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
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
          {posts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-blue-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No posts yet</h3>
            </div>
          )}

          {/* Posts Feed */}
          {posts.map((post) => (
             <PostCard key={post._id} post={post} />
          ))}

          {/* LOAD MORE BUTTON */}
          <div className="text-center py-4">
            {isFetchingNextPage ? (
               <Loader2 className="animate-spin mx-auto text-blue-600" />
            ) : hasNextPage ? (
              <button 
                onClick={() => fetchNextPage()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Load More Posts
              </button>
            ) : posts.length > 0 ? (
              <p className="text-gray-500 text-sm">You've reached the end!</p>
            ) : null}
          </div>

        </div>
      </div>
    </>
  );
};

export default Feed;