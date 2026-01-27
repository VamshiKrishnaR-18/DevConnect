import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import ZoomableProfilePic from "../components/ZoomableProfilePic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard"; 
import EditProfileModal from "../components/EditProfileModal";
import ImageCropperModal from "../components/ImageCropperModal"; 
import api from "../utils/api"; 
import { getProfileImageSrc } from "../utils/imageUtils"; // Ensure this import is correct
import { X, Edit2, Camera, UserMinus, UserCheck } from "lucide-react"; 

/* ===================== MODAL COMPONENT (User List) ===================== */
const UserListModal = ({ title, users, onClose, navigate, isOwnProfile, onUnfollow }) => {
  if (!users) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 bg-gray-50 dark:bg-gray-900/50">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</div>
          ) : (
            users.map((u, index) => {
               // Safe check for object
               const isObject = typeof u === 'object' && u !== null;
               if(!isObject) return null; 

               const username = u.username;
               const profilePic = u.profilePic || u.profilepic; // Handle both cases
               const userId = u._id;

               return (
                  <div 
                    key={userId || index} 
                    className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 mb-1 group"
                  >
                    {/* User Info (Clickable) */}
                    <div 
                        onClick={() => { navigate(`/profile/${username}`); onClose(); }} 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                        <img
                          src={getProfileImageSrc(profilePic)} // <--- FIX: Uses Utility
                          alt={username}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{username}</span>
                    </div>

                    {/* Unfollow Button (Only for 'Following' list on OWN profile) */}
                    {isOwnProfile && title === 'Following' && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Stop click from navigating
                                onUnfollow(userId);
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Unfollow user"
                        >
                            <UserMinus size={18} />
                        </button>
                    )}
                  </div>
               )
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ===================== MAIN PROFILE COMPONENT ===================== */
function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const socket = useSocket();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // UI States
  const [activeList, setActiveList] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  
  // --- COVER PHOTO STATES ---
  const [tempCoverSrc, setTempCoverSrc] = useState(null); 
  const [showCropper, setShowCropper] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const coverInputRef = useRef(null);

  /* ===================== FETCH PROFILE ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/users/profile/${username}`);
        const data = response.data.data;
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
    if (profile && user && profile.user.followers) {
      const isFollower = profile.user.followers.some(f => {
        const id = typeof f === 'object' ? f._id : f;
        return id === user._id;
      });
      setIsFollowing(isFollower);
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
            followers: prev.user.followers.filter((f) => {
               const id = typeof f === 'object' ? f._id : f;
               return id !== followerId;
            }),
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

      await api.post(endpoint);
      setIsFollowing(!isFollowing);
      
      setProfile((prev) => {
         let newFollowers = [...prev.user.followers];
         if (isFollowing) {
            newFollowers = newFollowers.filter(f => {
                const id = typeof f === 'object' ? f._id : f;
                return id !== user._id;
            });
         } else {
            newFollowers.push(user); 
         }
         return { ...prev, user: { ...prev.user, followers: newFollowers } };
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update follow status.");
      setIsFollowing(!isFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  // --- NEW: Handle Unfollow from Modal List ---
  const handleUnfollowFromList = async (targetId) => {
    if (!window.confirm("Unfollow this user?")) return;

    try {
        await api.post(`/users/unfollow/${targetId}`);
        
        // Update local state: Remove user from 'following' list
        setProfile((prev) => ({
            ...prev,
            user: {
                ...prev.user,
                following: prev.user.following.filter(u => u._id !== targetId)
            }
        }));
    } catch (err) {
        console.error("Unfollow failed", err);
        alert("Failed to unfollow user");
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setProfile((prev) => ({
      ...prev,
      posts: prev.posts.filter(p => p._id !== deletedPostId)
    }));
  };

  /* ===================== COVER PHOTO HANDLERS ===================== */
  const onCoverFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTempCoverSrc(reader.result);
        setShowCropper(true); 
      });
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };

  const onCropComplete = async (croppedBlob) => {
    setShowCropper(false);
    setCoverLoading(true);

    const formData = new FormData();
    formData.append("coverPic", croppedBlob);

    try {
      const res = await api.put("/users/cover-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const updatedUser = res.data.data;
      setProfile((prev) => ({ ...prev, user: { ...prev.user, coverPic: updatedUser.coverPic } }));
      if (user?.username === profile.user.username) {
        login({ ...user, coverPic: updatedUser.coverPic });
      }
    } catch (err) {
      console.error("Cover upload failed", err);
    } finally {
      setCoverLoading(false);
      setTempCoverSrc(null);
    }
  };

  /* ===================== RENDER ===================== */
  if (loading) return <><Navbar /><div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div></>;
  if (error) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-red-500 dark:bg-gray-900">{error}</div></>;
  if (!profile) return null;

  const isOwnProfile = user?.username === profile.user.username;
  const userProfilePic = profile.user.profilepic || profile.user.profilePic;
  const userCoverPic = profile.user.coverPic;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
          
          {/* --- COVER PHOTO AREA --- */}
          <div className="relative h-48 md:h-64 bg-gray-200 dark:bg-gray-700 group">
            {userCoverPic ? (
               <img 
                 src={getProfileImageSrc(userCoverPic)} // Ensure utility is used here too
                 alt="Cover" 
                 className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
            
            {/* Loading Overlay */}
            {coverLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {/* Edit Cover Button (Owner Only) */}
            {isOwnProfile && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={coverInputRef} 
                   onChange={onCoverFileSelect} 
                   className="hidden" 
                 />
                 <button 
                   onClick={() => coverInputRef.current.click()}
                   className="bg-black/40 hover:bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-medium transition-colors"
                 >
                   <Camera size={16} />
                   Edit Cover
                 </button>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 -mt-16 text-center relative z-10">
            
            <ZoomableProfilePic
              profilePic={userProfilePic}
              username={profile.user.username}
              isOwnProfile={isOwnProfile}
              onUpload={(url) => {
                setProfile((prev) => ({ ...prev, user: { ...prev.user, profilePic: url } }));
                if (isOwnProfile) login({ ...user, profilePic: url });
              }}
            />

            {/* --- USERNAME & EDIT BUTTON --- */}
            <div className="flex flex-row items-center justify-center gap-2 mt-4 w-full">
              <h1 className="text-2xl font-bold dark:text-white">{profile.user.username}</h1>
              
              {isOwnProfile && (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 dark:hover:text-blue-400 rounded-full transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {profile.user.bio && (
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                {profile.user.bio}
              </p>
            )}

            <div className="flex justify-center gap-8 mt-4 dark:text-gray-200">
              <div className="flex flex-col items-center">
                <div className="font-bold text-lg">{profile.posts?.length || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div onClick={() => setActiveList('followers')} className="flex flex-col items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-1 rounded-lg transition-colors group">
                <div className="font-bold text-lg group-hover:text-blue-500 transition-colors">{profile.user.followers.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div onClick={() => setActiveList('following')} className="flex flex-col items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-1 rounded-lg transition-colors group">
                <div className="font-bold text-lg group-hover:text-blue-500 transition-colors">{profile.user.following.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
              </div>
            </div>

            {!isOwnProfile && user && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`mt-6 px-6 py-2 rounded-full text-white font-medium transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFollowing ? "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-6">
          <h2 className="text-xl font-bold mb-4 ml-1 dark:text-white">Posts</h2>
          {profile.posts?.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={{ ...post, user: typeof post.user === 'string' ? profile.user : post.user }}
                showDelete={true}
                onDelete={handlePostDeleted}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-10 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">No posts yet</div>
          )}
        </div>
      </div>

      <Footer />

      {activeList && (
        <UserListModal 
            title={activeList === 'followers' ? 'Followers' : 'Following'}
            users={activeList === 'followers' ? profile.user.followers : profile.user.following}
            onClose={() => setActiveList(null)}
            navigate={navigate}
            isOwnProfile={isOwnProfile} // <--- Pass this
            onUnfollow={handleUnfollowFromList} // <--- Pass action handler
        />
      )}

      {showEditModal && (
        <EditProfileModal 
          user={profile.user}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedUser) => {
             setProfile(prev => ({ ...prev, user: { ...prev.user, ...updatedUser } }));
             if (updatedUser.username !== user.username) {
               login({ ...user, ...updatedUser });
               navigate(`/profile/${updatedUser.username}`, { replace: true });
             }
          }}
        />
      )}

      {showCropper && tempCoverSrc && (
        <ImageCropperModal
          imageSrc={tempCoverSrc}
          aspect={3 / 1} 
          onCancel={() => {
            setShowCropper(false);
            setTempCoverSrc(null);
          }}
          onCropComplete={onCropComplete}
        />
      )}
    </>
  );
}

export default Profile;