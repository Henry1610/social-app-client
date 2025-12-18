import { useState } from "react";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PostMediaViewer = ({ media, content, className = "" }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div
        className={`flex-1 flex items-center justify-center text-gray-500 ${className}`}
      >
        <MessageCircle size={64} />
      </div>
    );
  }

  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === "video";

  return (
    <div
      className={`flex items-center justify-center bg-white relative w-full rounded-lg overflow-hidden ${className}`}
    >
      {currentMedia?.mediaUrl ? (
        isVideo ? (
          <video
            src={currentMedia.mediaUrl}
            controls
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
            onError={(e) => {
              e.target.src = "/videos/placeholder.mp4";
            }}
          />
        ) : (
          <img
            src={currentMedia.mediaUrl}
            alt={content}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
            onError={(e) => {
              e.target.src = "/images/placeholder.png";
            }}
          />
        )
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          <MessageCircle size={64} />
        </div>
      )}

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          {currentMediaIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIndex((prev) => prev - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 bg-opacity-75 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 hover:scale-110 transition-all z-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentMediaIndex < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIndex((prev) => prev + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 bg-opacity-75 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 hover:scale-110 transition-all z-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  currentMediaIndex === index
                    ? "bg-primary-btn w-6"
                    : "bg-gray-300 hover:bg-gray-400 w-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PostMediaViewer;
