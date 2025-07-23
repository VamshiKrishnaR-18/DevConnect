import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import { getProfileImageSrc } from "../utils/imageUtils";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import config from "../config/environment";

function Profile() {
  const { username } = useParams();
  const { user, login } = useContext(AuthContext);
  const socket = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Debug logging
  console.log("🔍 Profile Debug Info:", {
    username,
    currentURL: window.location.href,
    pathname: window.location.pathname,
    params: useParams()
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("🔍 Fetching profile for username:", username);
        console.log("🌐 API URL:", `${config.API_BASE_URL}/api/users/profile/${username}`);

        setLoading(true);
        setError(null);
        const response = await axios.get(`${config.API_BASE_URL}/api/users/profile/${username}`);
        console.log("✅ Profile response:", response.data);
        setProfile(response.data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        console.error("❌ Error response:", err.response?.data);

        if (err.response?.status === 404) {
          setError(`User "${username}" not found. This user may not exist or may have been deleted.`);
        } else {
          setError("Failed to load profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    } else {
      console.error("❌ No username provided in URL params");
      setError("No username provided in the URL");
      setLoading(false);
    }
  }, [username]);

  // Separate useEffect for following status
  useEffect(() => {
    if (profile && profile.user && user) {
      setIsFollowing(profile.user.followers?.includes(user._id));
    }
  }, [profile, user]);

  // Socket listeners for real-time follow/unfollow updates
  useEffect(() => {
    if (!socket || !profile) return;

    const handleUserFollowed = ({ followerId, followedId, followersCount }) => {
      if (followedId === profile.user._id) {
        setProfile(prev => ({
          ...prev,
          user: {
            ...prev.user,
            followers: [...prev.user.followers, followerId]
          }
        }));

        // Update following status if current user followed this profile
        if (user && followerId === user._id) {
          setIsFollowing(true);
        }
      }
    };

    const handleUserUnfollowed = ({ followerId, unfollowedId, followersCount }) => {
      if (unfollowedId === profile.user._id) {
        setProfile(prev => ({
          ...prev,
          user: {
            ...prev.user,
            followers: prev.user.followers.filter(id => id !== followerId)
          }
        }));

        // Update following status if current user unfollowed this profile
        if (user && followerId === user._id) {
          setIsFollowing(false);
        }
      }
    };

    socket.on("userFollowed", handleUserFollowed);
    socket.on("userUnfollowed", handleUserUnfollowed);

    return () => {
      socket.off("userFollowed", handleUserFollowed);
      socket.off("userUnfollowed", handleUserUnfollowed);
    };
  }, [socket, profile, user]);

  // Follow/Unfollow functionality
  const handleFollowToggle = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    try {
      const token = localStorage.getItem("token");

      const endpoint = isFollowing
        ? `${config.API_BASE_URL}/api/users/unfollow/${profile.user._id}`
        : `${config.API_BASE_URL}/api/users/follow/${profile.user._id}`;


      await axios.put(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the local state
      setIsFollowing(!isFollowing);

      // Update the profile's followers count
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers: isFollowing
            ? prev.user.followers.filter(id => id !== user._id)
            : [...prev.user.followers, user._id]
        }
      }));

    } catch (error) {
      console.error("Follow/unfollow error:", error);
      setError("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-100">
          <div className="max-w-4xl mx-auto p-8">
            {/* Loading Skeleton */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"></div>
              <div className="p-8">
                <div className="flex flex-col items-center -mt-16">
                  <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse border-4 border-white dark:border-gray-800"></div>
                  <div className="mt-4 h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="mt-2 h-4 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Profile
              </h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              The user profile you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto p-8">
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-r from-red-300 via-purple-500 to-pink-500 relative">
              {/* Removed the black overlay that might be causing issues */}
            </div>

            {/* Profile Content */}
            <div className="px-8 pb-8">
              <div className="flex flex-col items-center text-center -mt-16">
                {/* Zoomable Profile Picture */}
                <ZoomableProfilePic
                  profilePic={profile.user.profilepic}
                  username={profile.user.username}
                  isOwnProfile={user && user.username === profile.user.username}
                  size="large"
                  onUpload={(url) => {
                    // Update the profile state
                    setProfile((prev) => ({
                      ...prev,
                      user: { ...prev.user, profilepic: url },
                    }));

                    // Update the AuthContext if this is the current user's profile
                    if (user && user.username === profile.user.username) {
                      const updatedUser = { ...user, profilepic: url };
                      const token = localStorage.getItem("token");
                      login(updatedUser, token);
                    }
                  }}
                />

                {/* User Info */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {profile.user.username}
                    </h1>
                    <div className="flex items-center justify-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Joined{" "}
                        {new Date(profile.user.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>

                  {profile.user.bio && (
                    <div className="max-w-2xl">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {profile.user.bio}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-center space-x-8 py-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.posts?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Posts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.user.followers?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.user.following?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Following
                      </div>
                    </div>
                  </div>

                  {/* Follow/Unfollow Button - Only show if viewing another user's profile */}
                  {user && user.username !== profile.user.username && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {followLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>{isFollowing ? "Unfollowing..." : "Following..."}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isFollowing ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 12H6"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              )}
                            </svg>
                            <span>{isFollowing ? "Unfollow" : "Follow"}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}

                  {profile.user.links?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3">
                      {profile.user.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          {new URL(link).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>

          {/* Posts Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  Posts
                </h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {profile.posts?.length || 0} posts
                </span>
              </div>

              {profile.posts?.length > 0 ? (
                <div className="space-y-6">
                  {profile.posts.map((post, index) => (
                    <div
                      key={post.id || index}
                      className="group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={getProfileImageSrc(profile.user.profilepic)}
                          alt={profile.user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                          onError={(e) => {
                            e.target.src = "/defaultAvatar.svg";
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {profile.user.username}
                            </h3>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              •
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(post.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                            {post.content}
                          </p>

                          {/* Post Actions */}
                          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span className="text-sm">
                                {post.likes?.length || 0}
                              </span>
                            </button>
                            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span className="text-sm">
                                {post.comments?.length || 0}
                              </span>
                            </button>
                            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                />
                              </svg>
                              <span className="text-sm">Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When {profile.user.username} shares something, it will
                    appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
