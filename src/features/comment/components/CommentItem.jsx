import { useState, useEffect, useRef } from "react";
import { Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetRepliesByCommentQuery, useReplyCommentMutation } from "../api/commentApi";
import { useGetReactionsQuery, useGetMyReactionQuery, useCreateOrUpdateReactionMutation, useGetReactionStatsQuery } from "../../reaction/api/reactionApi";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import confirmToast from "../../../components/common/confirmToast";
import ReactionsModal from "../../reaction/components/ReactionsModal";
import { reactionTypes } from "../../reaction/constants/reactionTypes";

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
  const [localReactionCount, setLocalReactionCount] = useState(comment._count?.reactions || 0);
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localReactionType, setLocalReactionType] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionStats, setShowReactionStats] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const hideTimeoutRef = useRef(null);
  const statsHideTimeoutRef = useRef(null);

  const MAX_DEPTH = 3;
  const canReply = depth < MAX_DEPTH;

  // Fetch reactions data
  const { data: reactionsData } = useGetReactionsQuery(
    { targetId: comment.id, targetType: "COMMENT" },
    { skip: !comment.id }
  );
  
  const { data: myReactionData } = useGetMyReactionQuery(
    { targetId: comment.id, targetType: "COMMENT" },
    { skip: !comment.id || !currentUser?.id }
  );

  const { data: reactionStatsData, isLoading: loadingStats } = useGetReactionStatsQuery(
    { targetId: comment.id, targetType: "COMMENT" },
    { skip: !comment.id || localReactionCount === 0 }
  );

  const [createOrUpdateReaction, { isLoading: isReacting }] = useCreateOrUpdateReactionMutation();

  // Update local state when data changes
  const reactions = reactionsData?.reactions || [];
  const myReaction = myReactionData?.reaction;
  const reactionCount = reactions.length;
  const isLiked = !!myReaction;
  const currentReactionType = myReaction?.reactionType || null;

  // Sync local state with fetched data
  useEffect(() => {
    setLocalReactionCount(reactionCount);
    setLocalIsLiked(isLiked);
    setLocalReactionType(currentReactionType);
    // Ẩn picker nếu đã có reaction
    if (isLiked) {
      setShowReactionPicker(false);
    }
  }, [reactionCount, isLiked, currentReactionType]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (statsHideTimeoutRef.current) {
        clearTimeout(statsHideTimeoutRef.current);
      }
    };
  }, []);

  // Group reactions by type để hiển thị icons
  const reactionsByType = reactions.reduce((acc, reaction) => {
    const type = reaction.reactionType;
    if (!acc[type]) {
      acc[type] = true;
    }
    return acc;
  }, {});

  // Lấy các reaction types đã được sử dụng (tối đa 3)
  const usedReactionTypes = Object.keys(reactionsByType).slice(0, 3);

  const handleUserClick = (username) => {
    if (onClose) {
      onClose();
    }
    navigate(`/${username}`);
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
    }
  };

  const handleReaction = async (reactionType = null, e = null) => {
    // Stop propagation nếu có event (từ nút Thích)
    if (e) {
      e.stopPropagation();
    }
    
    if (isReacting || !currentUser) return;

    // Nếu reactionType là null, dùng logic toggle: unreact nếu đã có, LIKE nếu chưa có
    const targetType = reactionType ?? (localReactionType || 'LIKE');
    const currentType = localReactionType;
    const isSameReaction = currentType === targetType;

    // Nếu đang bỏ reaction (click vào cùng loại đã có), cần xác nhận
    if (localIsLiked && isSameReaction) {
      const confirm = await confirmToast("Bạn có chắc chắn muốn bỏ thích bình luận này?");
      if (!confirm) return;
    }

    // Optimistic update
    const wasLiked = localIsLiked;
    const oldCount = localReactionCount;
    const wasSameType = currentType === targetType;
    
    let newCount = oldCount;
    if (wasLiked && wasSameType) {
      // Bỏ reaction
      newCount = oldCount - 1;
      setLocalIsLiked(false);
      setLocalReactionType(null);
    } else if (wasLiked && !wasSameType) {
      // Đổi reaction type (giữ nguyên count)
      setLocalReactionType(targetType);
    } else {
      // Thêm reaction mới
      newCount = oldCount + 1;
      setLocalIsLiked(true);
      setLocalReactionType(targetType);
    }
    setLocalReactionCount(newCount);
    setShowReactionPicker(false);

    try {
      await createOrUpdateReaction({
        targetId: comment.id,
        targetType: "COMMENT",
        type: targetType,
      }).unwrap();
    } catch (error) {
      // Revert optimistic update nếu có lỗi
      setLocalIsLiked(wasLiked);
      setLocalReactionCount(oldCount);
      setLocalReactionType(currentType);
      console.error("Error toggling reaction:", error);
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
    return depth === 1 ? '0px' : '2px';
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
        
        <div className="flex items-center justify-between mt-1">
          {/* Bên trái: Thời gian, Thích, Phản hồi */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 flex items-center">
              {formatTimeAgo(comment.createdAt)}
            </p>
            
            {/* Reaction Button với Picker */}
            <div className="relative flex items-center">
            <button
              onClick={(e) => handleReaction(null, e)}
              onMouseEnter={() => {
                // Chỉ hiển thị picker nếu chưa có reaction
                if (!localIsLiked) {
                  if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                  }
                  setShowReactionPicker(true);
                }
              }}
              onMouseLeave={() => {
                if (!localIsLiked) {
                  hideTimeoutRef.current = setTimeout(() => {
                    setShowReactionPicker(false);
                  }, 200);
                }
              }}
              disabled={isReacting || !currentUser}
              className={`text-xs transition-colors relative flex items-center ${
                localIsLiked
                  ? "text-blue-600 hover:text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-700 font-medium"
              } ${isReacting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {localIsLiked && localReactionType ? (
                <span className={reactionTypes.find(r => r.type === localReactionType)?.color || 'text-blue-600'}>
                  {reactionTypes.find(r => r.type === localReactionType)?.label || 'Thích'}
                </span>
              ) : (
                <span>Thích</span>
              )}
              </button>
              
              {/* Reaction Picker Menu */}
              {showReactionPicker && !isReacting && currentUser && (
                <div
                  className="absolute bottom-full left-0 mb-0.5 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-50"
                  onMouseEnter={() => {
                    if (hideTimeoutRef.current) {
                      clearTimeout(hideTimeoutRef.current);
                      hideTimeoutRef.current = null;
                    }
                    setShowReactionPicker(true);
                  }}
                  onMouseLeave={() => {
                    hideTimeoutRef.current = setTimeout(() => {
                      setShowReactionPicker(false);
                    }, 200);
                  }}
                >
                  {reactionTypes.map((reaction) => {
                    const IconComponent = reaction.icon;
                    return (
                      <button
                        key={reaction.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(reaction.type);
                        }}
                        className={`w-12 h-12 flex items-center justify-center rounded-full hover:scale-125 transition-transform ${
                          localReactionType === reaction.type
                            ? "bg-blue-50 ring-2 ring-blue-500"
                            : "hover:bg-gray-100"
                        }`}
                        title={reaction.label}
                      >
                        <IconComponent size={32} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {canReply ? (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center"
              >
                Phản hồi
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic flex items-center" title="Đã đạt giới hạn tối đa 3 cấp nested">
                Không thể phản hồi
              </span>
            )}
          </div>

          {/* Bên phải: Số lượng và icon reactions */}
          {localReactionCount > 0 && (
            <div 
              className="relative flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowReactionsModal(true);
              }}
              onMouseEnter={() => {
                if (statsHideTimeoutRef.current) {
                  clearTimeout(statsHideTimeoutRef.current);
                  statsHideTimeoutRef.current = null;
                }
                setShowReactionStats(true);
              }}
              onMouseLeave={() => {
                statsHideTimeoutRef.current = setTimeout(() => {
                  setShowReactionStats(false);
                }, 200);
              }}
            >
              <span className="text-xs text-gray-700 font-medium">
                {localReactionCount > 1000 
                  ? `${(localReactionCount / 1000).toFixed(1)}K`.replace('.0', '')
                  : localReactionCount.toLocaleString()}
              </span>
              <div className="flex items-center gap-0.5">
                {usedReactionTypes.map((type) => {
                  const reaction = reactionTypes.find(r => r.type === type);
                  if (!reaction) return null;
                  const IconComponent = reaction.icon;
                  return (
                    <span key={type} className="flex items-center">
                      <IconComponent size={16} />
                    </span>
                  );
                })}
              </div>

              {/* Reaction Stats Popup */}
              {showReactionStats && (
                <div
                  className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white rounded-lg shadow-lg p-3 min-w-[200px] z-50"
                  onMouseEnter={() => {
                    if (statsHideTimeoutRef.current) {
                      clearTimeout(statsHideTimeoutRef.current);
                      statsHideTimeoutRef.current = null;
                    }
                    setShowReactionStats(true);
                  }}
                  onMouseLeave={() => {
                    statsHideTimeoutRef.current = setTimeout(() => {
                      setShowReactionStats(false);
                    }, 200);
                  }}
                >
                  {loadingStats ? (
                    <div className="text-sm text-gray-300">Đang tải...</div>
                  ) : reactionStatsData?.stats ? (
                    <div className="space-y-2">
                      {Object.entries(reactionStatsData.stats)
                        .sort((a, b) => b[1] - a[1]) // Sort by count descending
                        .map(([type, count]) => {
                          const reactionType = reactionTypes.find(r => r.type === type);
                          if (!reactionType) return null;
                          const IconComponent = reactionType.icon;
                          return (
                            <div key={type} className="flex items-center gap-2">
                              <IconComponent size={20} />
                              <span className="text-sm font-medium text-white">
                                {count > 1000 
                                  ? `${(count / 1000).toFixed(1)}K`.replace('.0', '')
                                  : count.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300">Không có dữ liệu</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Replies toggle button - separate line */}
        {comment._count?.replies > 0 && (
          <div className="mt-2">
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
                onChange={(e) => setReplyText(e.target.value)}
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

      {/* Reactions Modal */}
      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        targetId={comment.id}
        targetType="COMMENT"
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default CommentItem;

