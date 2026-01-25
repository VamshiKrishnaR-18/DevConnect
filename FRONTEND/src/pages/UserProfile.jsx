import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContextStore";
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

  /* ===================== FETCH PROFILE ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${config.API_BASE_URL}/api/users/profile/${username}`
        );

        // ✅ IMPORTANT FIX
        setProfile(response.data.data);
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

    const handleUserFollowed = ({ followerId, followedId }) => {
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

    const handleUserUnfollowed = ({ followerId, unfollowedId }) => {
      if (unfollowedId === profile.user._id) {
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers: prev.user.followers.filter(
              (id) => id !== followerId
            ),
          },
        }));
      }
    };

    socket.on("userFollowed", handleUserFollowed);
    socket.on("userUnfollowed", handleUserUnfollowed);

    return () => {
      socket.off("userFollowed", handleUserFollowed);
      socket.off("userUnfollowed", handleUserUnfollowed);
    };
  }, [socket, profile]);

  /* ===================== FOLLOW / UNFOLLOW ===================== */
  const handleFollowToggle = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing
        ? `${config.API_BASE_URL}/api/users/unfollow/${profile.user._id}`
        : `${config.API_BASE_URL}/api/users/follow/${profile.user._id}`;

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsFollowing(!isFollowing);
    } catch {
      setError("Failed to update follow status.");
    } finally {
      setFollowLoading(false);
    }
  };

  /* ===================== STATES ===================== */
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

  /* ===================== RENDER ===================== */
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
              profilePic={profile.user.profilePic}
              username={profile.user.username}
              isOwnProfile={user?.username === profile.user.username}
              onUpload={(url) => {
                setProfile((prev) => ({
                  ...prev,
                  user: { ...prev.user, profilePic: url },
                }));

                if (user?.username === profile.user.username) {
                  login({ ...user, profilePic: url }, localStorage.getItem("token"));
                }
              }}
            />

            <h1 className="text-2xl font-bold mt-4">
              {profile.user.username}
            </h1>

            {profile.user.bio && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {profile.user.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-4">
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
                className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-4xl mx-auto mt-6">
          {profile.posts?.length > 0 ? (
            profile.posts.map((post) => (
              <div key={post._id} className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-xl shadow">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={getProfileImageSrc(profile.user.profilePic)}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                  />
                  <span className="font-semibold">{profile.user.username}</span>
                </div>
                <p>{post.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-10">
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
