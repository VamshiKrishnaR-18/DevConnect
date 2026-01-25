import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard"; 
import api from "../utils/api"; 

function Profile() {
  const { username } = useParams();
  const { user, login } = useContext(AuthContext);
  const socket = useSocket();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  /* ===================== FETCH PROFILE ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/users/profile/${username}`);
        const data = response.data.data;

        // SORTING: Ensure Newest Posts come first
        if (data.posts && Array.isArray(data.posts)) {
            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setProfile(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError(`User "${username}" not found.`);
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  /* ===================== FOLLOW STATUS ===================== */
  useEffect(() => {
    if (profile && user) {
      setIsFollowing(profile.user.followers?.includes(user._id));
    }
  }, [profile, user]);

  /* ===================== SOCKET EVENTS ===================== */
  useEffect(() => {
    if (!socket || !profile) return;

    const handleUserFollowed = (payload) => {
      const data = payload.data || payload;
      const { followerId, followedId } = data;

      if (followedId === profile.user._id) {
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers: [...prev.user.followers, followerId],
          },
        }));
      }
    };

    const handleUserUnfollowed = (payload) => {
      const data = payload.data || payload;
      const { followerId, unfollowedId } = data;

      if (unfollowedId === profile.user._id) {
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers: prev.user.followers.filter((id) => id !== followerId),
          },
        }));
      }
    };

    socket.on("user:followed", handleUserFollowed);
    socket.on("user:unfollowed", handleUserUnfollowed);

    return () => {
      socket.off("user:followed", handleUserFollowed);
      socket.off("user:unfollowed", handleUserUnfollowed);
    };
  }, [socket, profile]);

  /* ===================== ACTIONS ===================== */
  const handleFollowToggle = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    try {
      const endpoint = isFollowing
        ? `/users/unfollow/${profile.user._id}`
        : `/users/follow/${profile.user._id}`;

      await api.put(endpoint);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
      setError("Failed to update follow status.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setProfile((prev) => ({
      ...prev,
      posts: prev.posts.filter(p => p._id !== deletedPostId)
    }));
  };

  /* ===================== RENDER ===================== */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading profile...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {error}
        </div>
      </>
    );
  }

  if (!profile) return null;

  const userProfilePic = profile.user.profilepic || profile.user.profilePic;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>

          {/* Profile */}
          <div className="px-6 pb-6 -mt-16 text-center">
            
            <ZoomableProfilePic
              profilePic={userProfilePic}
              username={profile.user.username}
              isOwnProfile={user?.username === profile.user.username}
              onUpload={(url) => {
                setProfile((prev) => ({
                  ...prev,
                  user: { ...prev.user, profilePic: url }, 
                }));
                if (user?.username === profile.user.username) {
                  login({ ...user, profilePic: url });
                }
              }}
            />

            <h1 className="text-2xl font-bold mt-4 dark:text-white">{profile.user.username}</h1>

            {profile.user.bio && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {profile.user.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-4 dark:text-gray-200">
              <div>
                <div className="font-bold">{profile.posts?.length || 0}</div>
                <div className="text-sm">Posts</div>
              </div>
              <div>
                <div className="font-bold">{profile.user.followers.length}</div>
                <div className="text-sm">Followers</div>
              </div>
              <div>
                <div className="font-bold">{profile.user.following.length}</div>
                <div className="text-sm">Following</div>
              </div>
            </div>

            {/* Follow button */}
            {user && user.username !== profile.user.username && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-2xl mx-auto mt-6">
          <h2 className="text-xl font-bold mb-4 ml-1 dark:text-white">Posts</h2>
          
          {profile.posts?.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={{
                    ...post,
                    user: typeof post.user === 'string' ? profile.user : post.user 
                }}
                // Pass showDelete=true ONLY here in UserProfile
                showDelete={true}
                onDelete={handlePostDeleted}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-10 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                No posts yet
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Profile;