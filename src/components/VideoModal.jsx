import React from 'react';

function VideoModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-red-500">×</button>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/1La4QzGeaaQ"
            title="Video Institucional INFOUNA"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
