import { X, Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";

const CommentsModal = ({
  isOpen,
  onClose,
  comments = [],
  isLoading,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  onDeleteComment,
  isCommenting,
  isDeletingComment,
}) => {
  const currentUser = useSelector(selectCurrentUser);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Bình luận</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Đang tải bình luận...
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img
                    src={
                      comment.user?.avatarUrl ||
                      "/images/avatar-IG-mac-dinh-1.jpg"
                    }
                    alt={comment.user?.username}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 relative">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {comment.user?.username}
                        </span>{" "}
                        <span className="text-gray-700">{comment.content}</span>
                      </p>
                      {comment.userId === currentUser?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteComment(comment.id);
                          }}
                          disabled={isDeletingComment}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-opacity disabled:opacity-50"
                          title="Xóa bình luận"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {comment._count?.replies > 0 && (
                        <> • {comment._count.replies} phản hồi</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Chưa có bình luận nào
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={onSubmitComment} className="flex gap-2 items-center">
            <img
              src={
                currentUser?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"
              }
              alt={currentUser?.username}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => {
                  e.stopPropagation();
                  onCommentTextChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmitComment(e);
                  }
                }}
                placeholder="Thêm bình luận..."
                className="w-full px-3 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
                disabled={isCommenting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isCommenting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isCommenting ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;

