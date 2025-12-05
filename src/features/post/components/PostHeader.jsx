import { Repeat2 } from "lucide-react";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import { useState } from "react";

const PostHeader = ({
  user,
  createdAt,
  content,
  isRepost = false,
  repostedBy = null,
  onNavigate,
  size = "normal",
}) => {
  const displayUser = isRepost && repostedBy ? repostedBy : user;
  const avatarSize = size === "small" ? "w-6 h-6" : "w-10 h-10";
  const textSize = size === "small" ? "text-sm" : "text-sm";

  const [expanded, setExpanded] = useState(false);
  const limit = 150;
  const contentText = content || "";
  const isLong = contentText.length > limit;
  const displayedText = expanded ? contentText : contentText.slice(0, limit);
  const hasContent = contentText.trim().length > 0;

  return (
    <div className={`flex gap-2 ${size === "small" ? "mb-2" : ""}`}>
      {/* Avatar */}
      <img
        src={
          displayUser?.avatarUrl ||
          displayUser?.avatar ||
          "/images/avatar-IG-mac-dinh-1.jpg"
        }
        onClick={() => onNavigate(`/${displayUser?.username}`)}
        alt={displayUser?.username}
        className={`${avatarSize} rounded-full flex-shrink-0 object-cover`}
      />

      {/* Right content */}
      <div className={`flex-1 min-w-0 ${!hasContent ? 'flex items-center' : ''}`}>
        {/* === Top row: username + verified + time === */}
        <div className="flex items-center gap-1 flex-wrap">
          {isRepost && repostedBy ? (
            <>
              <button
                onClick={() => onNavigate(`/${repostedBy.username}`)}
                className={`font-semibold ${textSize} hover:underline`}
              >
                {repostedBy.username}
              </button>

              <Repeat2 size={14} className="text-gray-500 flex-shrink-0" />
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate(`/${user?.username}`)}
                className={`font-semibold ${textSize} hover:underline`}
              >
                {user?.username}
              </button>

              {user?.verified && (
                <svg
                  className="w-3 h-3 text-blue-500 fill-current flex-shrink-0"
                  viewBox="0 0 40 40"
                >
                  <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
                </svg>
              )}
            </>
          )}

          {/* Time */}
          <span className="text-gray-500 text-xs">
            • {formatTimeAgo(createdAt)}
          </span>
        </div>
        {/* === Content below === */}
        {hasContent && (
        <div className="mt-0.5 leading-tight">
          <span className={`${textSize}`}>
            {displayedText}
            {!expanded && isLong && " ... "}
          </span>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`font-semibold hover:underline ml-1 ${textSize}`}
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default PostHeader;
