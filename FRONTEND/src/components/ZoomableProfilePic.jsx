import React, { useState } from "react";
import { getProfileImageSrc } from "../utils/imageUtils";
import MinimalProfilePicUploader from "./MinimalProfilePicUploader";

function ZoomableProfilePic({ 
  profilePic, 
  username, 
  isOwnProfile = false, 
  onUpload,
  size = "large" // "small", "medium", "large"
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24", 
    large: "w-32 h-32"
  };

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
    setShowEditOptions(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowEditOptions(true);
  };

  return (
    <>
      {/* Profile Picture */}
      <div className="relative group inline-block">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105`}
          onClick={handleImageClick}
          title="Click to view"
        >
          <img
            src={getProfileImageSrc(profilePic)}
            alt={`${username}'s profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/defaultAvatar.svg";
            }}
          />
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          
          {/* Close Button */}
          <button
            onClick={handleCloseZoom}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20 p-2"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Edit Photo Button (Top Left) */}
          {isOwnProfile && !showEditOptions && (
            <button
              onClick={handleEditClick}
              className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all backdrop-blur-md border border-white/20 z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Change Photo</span>
            </button>
          )}

          {/* Zoomed Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full flex justify-center">
            <img
              src={getProfileImageSrc(profilePic)}
              alt={`${username}'s profile`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.src = "/defaultAvatar.svg";
              }}
            />
          </div>

          {/* Edit Options Panel */}
          {showEditOptions && isOwnProfile && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-4">
              {/* FLEX COL FIX: Stacks items vertically */}
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Update Profile Picture
                </h3>
                
                <div className="mb-2">
                  <MinimalProfilePicUploader
                    onUpload={(url) => {
                      onUpload(url);
                      handleCloseZoom();
                    }}
                  />
                </div>
                
                <button
                  onClick={() => setShowEditOptions(false)}
                  className="mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={handleCloseZoom}
          />
        </div>
      )}
    </>
  );
}

export default ZoomableProfilePic;