import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { X, Check, ZoomIn } from "lucide-react";

export default function ImageCropperModal({ imageSrc, aspect = 3 / 1, onCancel, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = useCallback((crop) => setCrop(crop), []);
  const onZoomChange = useCallback((zoom) => setZoom(zoom), []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage); // Send the Blob back to parent
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-black/50 p-4 flex justify-between items-center text-white z-10 backdrop-blur-md">
        <h3 className="font-bold">Adjust Cover Photo</h3>
        <div className="flex gap-4">
          <button onClick={onCancel} className="text-white/70 hover:text-white flex items-center gap-1">
            <X size={20} /> Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-full flex items-center gap-2 font-medium transition-colors"
          >
            {loading ? "Processing..." : <><Check size={18} /> Apply</>}
          </button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="relative flex-1 bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect} // 3:1 is standard for covers
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
          showGrid={true} // <--- THE SIZE GRID
        />
      </div>

      {/* Zoom Slider */}
      <div className="p-6 bg-black/50 backdrop-blur-md flex items-center justify-center gap-4 z-10">
        <ZoomIn size={20} className="text-white/70" />
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          className="w-full max-w-md h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}