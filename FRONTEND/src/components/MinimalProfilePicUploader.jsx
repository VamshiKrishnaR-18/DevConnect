import { useState } from "react";
import { usersAPI } from "../utils/api";

function MinimalProfilePicUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Clear previous error
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPEG, JPG, or PNG)');
      setFile(null);
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Auto-upload when file is selected
    handleUpload(selectedFile);
  };

  const handleUpload = async (fileToUpload = file) => {
    if (!fileToUpload) return;

    setUploading(true);
    setError(null);

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to upload a profile picture");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("profilepic", fileToUpload);

    try {
      const res = await usersAPI.updateProfilePic(formData);

      onUpload(res.data.profilepic);
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      if (error.code === 'ECONNABORTED') {
        setError("Upload timed out. Please try again with a smaller file.");
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(
          error.response?.data?.message ||
          error.message ||
          "Upload failed. Please try again."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Minimal Upload Button */}
      <div className="relative">
        <input
          id="minimal-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => !uploading && document.getElementById('minimal-file-input').click()}
          disabled={uploading}
          className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
            uploading
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Change Photo</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center max-w-xs">
          <p className="text-red-500 dark:text-red-400 text-xs leading-tight">{error}</p>
        </div>
      )}
    </div>
  );
}

export default MinimalProfilePicUploader;
