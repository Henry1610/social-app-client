import { useState, useEffect } from "react";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PostMediaViewer = ({ media, content, className = "" }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload ảnh trước và sau ảnh hiện tại
  useEffect(() => {
    if (!media || media.length === 0) return;

    const preloadImages = () => {
      // Preload ảnh hiện tại, trước và sau
      const indicesToPreload = [
        currentMediaIndex,
        currentMediaIndex - 1,
        currentMediaIndex + 1,
      ].filter((i) => i >= 0 && i < media.length);

      indicesToPreload.forEach((index) => {
        const item = media[index];
        if (item?.type !== "video" && item?.mediaUrl && !loadedImages[index]) {
          const img = new Image();
          img.src = item.mediaUrl;
          img.onload = () => {
            setLoadedImages((prev) => ({ ...prev, [index]: true }));
          };
        }
      });
    };

    preloadImages();
  }, [currentMediaIndex, media, loadedImages]);

  const handleNavigate = (direction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentMediaIndex((prev) => prev + direction);
    
    setTimeout(() => setIsTransitioning(false), 150);
  };

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
      {/* Loading indicator */}
      {!isVideo && !loadedImages[currentMediaIndex] && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {currentMedia?.mediaUrl ? (
        <div
          className={`transition-opacity duration-150 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {isVideo ? (
            <video
              key={currentMediaIndex} // Force remount để reset video state
              src={currentMedia.mediaUrl}
              controls
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
              preload="metadata"
              onError={(e) => {
                e.target.src = "/videos/placeholder.mp4";
              }}
            />
          ) : (
            <img
              src={currentMedia.mediaUrl}
              alt={content}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
              loading="eager"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
          )}
        </div>
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
                handleNavigate(-1);
              }}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-70 active:scale-95 transition-all z-40 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentMediaIndex < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(1);
              }}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-70 active:scale-95 transition-all z-40 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-30 px-3 py-2 rounded-full z-50">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentMediaIndex(index);
                    setTimeout(() => setIsTransitioning(false), 150);
                  }
                }}
                disabled={isTransitioning}
                className={`h-2 rounded-full transition-all ${
                  currentMediaIndex === index
                    ? "bg-white w-6"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75 w-2"
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