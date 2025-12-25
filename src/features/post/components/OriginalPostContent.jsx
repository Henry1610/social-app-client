import { Lock } from "lucide-react";
import PostHeader from "./PostHeader";
import PostMediaViewer from "./PostMediaViewer";
import PostActions from "./PostActions";

/**
 * Component để render bài gốc bên trong repost
 * Tách riêng để code gọn gàng và dễ maintain
 */
function OriginalPostContent({
  user,
  content,
  media = [],
  createdAt,
  // Stats của bài gốc
  likesCount = 0,
  commentsCount = 0,
  savesCount = 0,
  repostsCount = 0,
  // Trạng thái tương tác của bài gốc
  isLiked = false,
  isSaved = false,
  isReposted = false,
  // Loading states
  isReacting = false,
  isSaving = false,
  isReposting = false,
  // Handlers
  onToggleLike,
  onToggleSave,
  onToggleRepost,
  onOpenComments,
  onOpenLikes,
  navigate,
  isDeleted = false,
}) {
  // Nếu post gốc bị xóa hoặc bị ẩn, hiển thị thông báo
  if (isDeleted) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 mb-3 bg-gray-50">
        <div className="flex items-start gap-4">
          {/* Icon khóa */}
          <div className="flex-shrink-0">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>
          
          {/* Nội dung thông báo */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Nội dung này hiện không hiển thị
            </h3>
            <p className="text-sm text-gray-500">
              Lỗi này thường do chủ sở hữu chỉ chia sẻ nội dung với một nhóm nhỏ, thay đổi người được xem hoặc đã xóa nội dung.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3 mb-3">
      {/* Post Header */}
      <PostHeader
        user={user}
        createdAt={createdAt}
        content={content}
        isRepost={false}
        onNavigate={navigate}
        size="small"
      />

      {/* Media */}
      {media.length > 0 && (
        <div className="mt-2 mb-3 mx-auto w-full rounded-md overflow-hidden relative">
          <PostMediaViewer
            media={media}
            content={content}
            className="!flex-none w-full rounded-md"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <PostActions
          isLiked={isLiked}
          isReposted={isReposted}
          isSaved={isSaved}
          isReacting={isReacting}
          isReposting={isReposting}
          isSaving={isSaving}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleRepost={onToggleRepost}
          onToggleSave={onToggleSave}
          showRepost={true}
          showSave={true}
          size={18}
        />
      </div>

      {/* Stats */}
      {(likesCount > 0 || commentsCount > 0 || savesCount > 0 || repostsCount > 0) && (
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          {likesCount > 0 && (
            <button
              onClick={onOpenLikes}
              className="font-semibold hover:underline cursor-pointer"
            >
              {likesCount.toLocaleString()} lượt thích
            </button>
          )}
          {commentsCount > 0 && (
            <button
              onClick={onOpenComments}
              className="hover:underline cursor-pointer"
            >
              {commentsCount.toLocaleString()} bình luận
            </button>
          )}
          {savesCount > 0 && (
            <span>{savesCount.toLocaleString()} lượt lưu</span>
          )}
          {repostsCount > 0 && (
            <span>{repostsCount.toLocaleString()} lượt đăng lại</span>
          )}
        </div>
      )}
    </div>
  );
}

export default OriginalPostContent;

