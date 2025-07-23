import React, { useState } from 'react';
import { Camera, X, Image, Video } from 'lucide-react';

const MediaUploader = ({ onMediaSelect, maxFiles = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = (files) => {
    const fileArray = Array.from(files).slice(0, maxFiles);
    const validFiles = [];
    const newPreviews = [];

    fileArray.forEach((file) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`);
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB`);
        return;
      }

      validFiles.push(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            type: 'image',
            url: e.target.result,
            name: file.name,
            file: file
          });
          setPreviews(prev => [...prev.filter(p => p.name !== file.name), ...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          type: 'video',
          url: URL.createObjectURL(file),
          name: file.name,
          file: file
        });
        setPreviews(prev => [...prev.filter(p => p.name !== file.name), ...newPreviews]);
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    onMediaSelect([...selectedFiles, ...validFiles]);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onMediaSelect(newFiles);
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById('media-input').click()}
      >
        <input
          id="media-input"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Drop files here or click to select
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Images, GIFs, Videos (Max {maxFiles} files, 50MB each)
          </p>
        </div>
      </div>

      {/* Preview Area */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {preview.type === 'image' ? (
                <div className="relative">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute top-1 left-1 bg-black/50 rounded px-1">
                    <Image className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={preview.url}
                    className="w-full h-24 object-cover rounded-lg"
                    controls={false}
                  />
                  <div className="absolute top-1 left-1 bg-black/50 rounded px-1">
                    <Video className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
