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
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105`}
          onClick={handleImageClick}
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

        {/* Edit Icon Overlay - Only show for own profile */}
        {isOwnProfile && (
          <button
            onClick={handleEditClick}
            className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 transform hover:scale-110"
            title="Change profile picture"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          {/* Close Button */}
          <button
            onClick={handleCloseZoom}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Edit Button - Only show for own profile */}
          {isOwnProfile && (
            <button
              onClick={handleEditClick}
              className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit</span>
            </button>
          )}

          {/* Zoomed Image */}
          <div className="relative max-w-4xl max-h-full">
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Change Profile Picture
                </h3>
                <MinimalProfilePicUploader
                  onUpload={(url) => {
                    onUpload(url);
                    handleCloseZoom();
                  }}
                />
                <button
                  onClick={() => setShowEditOptions(false)}
                  className="mt-4 text-gray-500 hover:text-gray-700 text-sm transition-colors"
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
