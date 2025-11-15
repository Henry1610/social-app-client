import { Heart, MessageCircle, Repeat2, Bookmark, BookmarkCheck } from "lucide-react";

const PostActions = ({
  isLiked,
  isReposted,
  isSaved,
  isReacting,
  isReposting,
  isSaving,
  onToggleLike,
  onOpenComments,
  onToggleRepost,
  onToggleSave,
  showRepost = false,
  showSave = false,
  size = 22, // 18 for small, 22 for normal
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-700">
        <button
          onClick={onToggleLike}
          disabled={isReacting}
          className={`transition ${
            isLiked
              ? "text-red-500 hover:text-red-600"
              : "hover:text-gray-900"
          } ${isReacting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart
            size={size}
            fill={isLiked ? "currentColor" : "none"}
            className="transition"
          />
        </button>
        <button 
          onClick={onOpenComments}
          className="hover:text-gray-900 transition"
        >
          <MessageCircle size={size} />
        </button>
        {showRepost && (
          <button
            onClick={onToggleRepost}
            disabled={isReposting}
            className={`transition ${
              isReposted
                ? "text-green-500 hover:text-green-600"
                : "hover:text-gray-900"
            } ${isReposting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Repeat2
              size={size}
              fill={isReposted ? "currentColor" : "none"}
              className="transition"
            />
          </button>
        )}
      </div>
      {showSave && (
        <button
          onClick={onToggleSave}
          disabled={isSaving}
          className={`transition ${
            isSaved
              ? "text-blue-500 hover:text-blue-600"
              : "hover:text-gray-500"
          } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSaved ? (
            <BookmarkCheck size={size} className="transition" />
          ) : (
            <Bookmark size={size} className="transition" />
          )}
        </button>
      )}
    </div>
  );
};

export default PostActions;

