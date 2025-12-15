import { useState } from "react";
import { Send, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetRepliesByCommentQuery, useReplyCommentMutation } from "../api/commentApi";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";

// Component để hiển thị một comment và replies của nó (recursive, tối đa 3 cấp)
const CommentItem = ({ 
  comment, 
  currentUser, 
  onDeleteComment, 
  isDeletingComment,
  depth = 1,
  postId,
  repostId,
  onClose
}) => {
  const navigate = useNavigate();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const MAX_DEPTH = 3;
  const canReply = depth < MAX_DEPTH;

  const handleUserClick = (username) => {
    if (username) {
      if (onClose) {
        onClose();
      }
      navigate(`/${username}`);
    }
  };

  const { data: repliesData, isLoading: loadingReplies, refetch: refetchReplies } = useGetRepliesByCommentQuery(
    { commentId: comment.id, page: 1, limit: 50, sortBy: "desc" },
    { 
      skip: !showReplies
    }
  );
  const [replyComment, { isLoading: isReplyingMutation }] = useReplyCommentMutation();

  const replies = repliesData?.replies || [];
  const nextDepth = depth + 1;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isReplyingMutation || !canReply) return;

    setErrorMessage("");
    try {
      setIsReplying(true);
      if (!showReplies) {
        setShowReplies(true);
      }
      await replyComment({
        commentId: comment.id,
        content: replyText.trim(),
        postId: postId,
        repostId: repostId
      }).unwrap();
      setReplyText("");
      setIsReplying(false);
      await refetchReplies();
    } catch (error) {
      console.error("Error replying:", error);
      setIsReplying(false);
      // Hiển thị thông báo lỗi từ server
      const errorMsg = error?.data?.message || error?.message || "Không thể phản hồi. Vui lòng thử lại!";
      setErrorMessage(errorMsg);
    }
  };

  // Tính indent dựa trên depth: Level 1 = 0px, Level 2 = 16px, Level 3 = 32px
  const getIndentStyle = () => {
    if (depth === 1) return {};
    if (depth === 2) return { paddingLeft: '16px' };
    return { paddingLeft: '32px' };
  };

  // Tính border-left width dựa trên depth
  const getBorderWidth = () => {
    if (depth === 1) return '0px';
    if (depth === 2) return '2px';
    return '2px';
  };

  return (
    <div 
      className="flex gap-3 group"
      style={getIndentStyle()}
    >
      {/* Border indicator cho nested comments */}
      {depth > 1 && (
        <div 
          className="flex-shrink-0 border-l-2 border-gray-200"
          style={{ width: getBorderWidth() }}
        />
      )}
      
      <img
        src={comment.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
        alt={comment.user?.username}
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleUserClick(comment.user?.username)}
      />
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg p-3 relative">
          <div className="text-sm">
            <div className="mb-1 flex items-center gap-1 flex-wrap">
              <span 
                className="font-semibold text-gray-900 cursor-pointer hover:underline"
                onClick={() => handleUserClick(comment.user?.username)}
              >
                {comment.user?.username}
              </span>
              {comment.parent?.user && (
                <>
                  <span className="text-gray-400">→</span>
                  <span 
                    className="font-semibold text-gray-700 cursor-pointer hover:underline"
                    onClick={() => handleUserClick(comment.parent.user?.username)}
                  >
                    {comment.parent.user.username}
                  </span>
                </>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
          </div>
          
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
        
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-xs text-gray-500">
            {formatTimeAgo(comment.createdAt)}
          </p>
          
          {canReply ? (
            <button
              onClick={() => {
                setIsReplying(!isReplying);
                setErrorMessage("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Phản hồi
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic" title="Đã đạt giới hạn tối đa 3 cấp nested">
              Không thể phản hồi
            </span>
          )}
          
          {comment._count?.replies > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp size={14} />
                  Ẩn {comment._count.replies} phản hồi
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Xem {comment._count.replies} phản hồi
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Reply Input */}
        {isReplying && canReply && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2 items-start">
            <img
              src={currentUser?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
              alt={currentUser?.username}
              className="w-6 h-6 rounded-full flex-shrink-0 object-cover mt-0.5"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  setErrorMessage("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply(e);
                  }
                }}
                placeholder={`Phản hồi ${comment.user?.username}...`}
                className="w-full px-3 pr-10 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoFocus
                disabled={isReplyingMutation}
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isReplyingMutation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isReplyingMutation ? (
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </form>
        )}

        {/* Replies List */}
        {showReplies && (
          <div className="mt-3 space-y-3">
            {loadingReplies ? (
              <div className="text-xs text-gray-500 py-2">Đang tải phản hồi...</div>
            ) : replies.length > 0 ? (
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  onDeleteComment={onDeleteComment}
                  isDeletingComment={isDeletingComment}
                  depth={nextDepth}
                  postId={postId}
                  repostId={repostId}
                  onClose={onClose}
                />
              ))
            ) : (
              <div className="text-xs text-gray-500 py-2">Chưa có phản hồi</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;

