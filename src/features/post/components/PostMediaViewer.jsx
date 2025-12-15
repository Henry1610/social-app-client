import { useState, useEffect } from "react";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PostMediaViewer = ({ media, content, className = "" }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [media]);

  if (!media || media.length === 0) {
    return (
      <div
        className={`flex-1 flex items-center justify-center text-gray-500 ${className}`}
      >
        <MessageCircle size={64} />
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex items-center justify-center bg-black relative ${className}`}
    >
      {media[currentMediaIndex]?.mediaUrl ? (
        media[currentMediaIndex]?.type === "video" ? (
          <video
            src={media[currentMediaIndex].mediaUrl}
            controls
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.target.src = "/videos/placeholder.mp4";
            }}
          />
        ) : (
          <img
            src={media[currentMediaIndex].mediaUrl}
            alt={content}
            className="max-h-full max-w-full object-contain"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
          )}
          {currentMediaIndex < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIndex((prev) => prev + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
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
                    ? "bg-white w-6"
                    : "bg-gray-400 hover:bg-gray-300 w-2"
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
