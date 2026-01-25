import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import api from "../utils/api";

const MinimalProfilePicUploader = ({ currentPic, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("--> FRONTEND: File selected:", file.name, file.type, file.size);
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("profilePic", file);

    // Debug: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`--> FRONTEND: FormData Key: ${key}, Value:`, value);
    }

    try {
      console.log("--> FRONTEND: Sending request to /users/profile-pic...");
      const res = await api.put("/users/profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("--> FRONTEND: Upload success response:", res.data);

      if (onUpdate && res.data.data) {
        onUpdate(res.data.data.profilePic);
      } else if (onUpdate && res.data.profilePic) {
        onUpdate(res.data.profilePic);
      }
    } catch (err) {
      console.error("--> FRONTEND ERROR:", err.response?.data || err.message);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <button
        type="button"
        onClick={handleIconClick}
        disabled={uploading}
        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all disabled:opacity-50"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>
    </div>
  );
};

export default MinimalProfilePicUploader;