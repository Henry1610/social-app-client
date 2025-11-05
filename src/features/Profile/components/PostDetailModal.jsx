import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";
import { useGetPostByIdQuery, useUpdatePostMutation, useDeletePostMutation, postApi } from "../../post/postApi";
import { useGetCommentsByPostQuery, useCreateCommentMutation, useDeleteCommentMutation } from "../../comment/commentApi";
import { useGetMyReactionQuery, useCreateOrUpdateReactionMutation, useGetReactionsQuery } from "../../reaction/reactionApi";
import { Heart, MessageCircle, Share2, X, Settings, Send, CheckCircle, ChevronDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import confirmToast from "../../../components/common/confirmToast";
import { useDispatch } from "react-redux";

const PostDetailModal = ({ 
  postId, 
  repostId,
  onClose,
  showSettingsMenu: externalShowSettingsMenu,
  setShowSettingsMenu: externalSetShowSettingsMenu,
  showPrivacySettings: externalShowPrivacySettings,
  setShowPrivacySettings: externalSetShowPrivacySettings,
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [commentText, setCommentText] = useState("");
  const [privacySettings, setPrivacySettings] = useState({
    whoCanSee: "everyone",
    whoCanComment: "everyone",
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const settingsMenuRef = useRef(null);
  const privacySettingsRef = useRef(null);

  const { data: fullPostData } = useGetPostByIdQuery(postId || 0, {
    skip: !postId,
  });

  const selectedPostFull = fullPostData?.post;
  const isPostOwner = selectedPostFull && currentUser?.id === selectedPostFull.userId;
  const isRepost = !!repostId;

  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch: refetchComments,
  } = useGetCommentsByPostQuery(
    { 
      postId: isRepost ? undefined : (selectedPostFull?.id || 0), 
      repostId: isRepost ? repostId : undefined,
      page: 1, 
      limit: 10, 
      sortBy: "desc" 
    },
    { skip: !selectedPostFull?.id || (isRepost && !repostId) }
  );

  const comments = commentsData?.comments || [];

  const {
    data: myReactionData,
    isLoading: loadingMyReaction,
    refetch: refetchMyReaction,
  } = useGetMyReactionQuery(
    {
      targetId: isRepost ? repostId : (selectedPostFull?.id || 0),
      targetType: isRepost ? "REPOST" : "POST",
    },
    { skip: !selectedPostFull?.id || (isRepost && !repostId) }
  );

  const myReaction = myReactionData;
  const isLiked = !!myReaction;

  // Fetch stats của repost nếu là repost
  const { data: repostReactions } = useGetReactionsQuery(
    { targetId: repostId, targetType: 'REPOST' },
    { skip: !isRepost || !repostId }
  );

  // Stats để hiển thị: nếu là repost thì dùng stats của repost, không thì dùng stats của post
  const displayReactionCount = isRepost 
    ? (repostReactions?.reactions?.length || 0) 
    : (selectedPostFull?._count?.reactions || 0);
  const displayCommentCount = isRepost 
    ? (commentsData?.pagination?.totalComments || 0)
    : (selectedPostFull?._count?.comments || 0);

  const [createOrUpdateReaction, { isLoading: isReacting }] = useCreateOrUpdateReactionMutation();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const deleteMenuRefs = useRef({});

  const effectiveShowSettingsMenu = externalShowSettingsMenu !== undefined 
    ? externalShowSettingsMenu 
    : showSettingsMenu;
  const effectiveSetShowSettingsMenu = externalSetShowSettingsMenu || setShowSettingsMenu;
  const effectiveShowPrivacySettings = externalShowPrivacySettings !== undefined 
    ? externalShowPrivacySettings 
    : showPrivacySettings;
  const effectiveSetShowPrivacySettings = externalSetShowPrivacySettings || setShowPrivacySettings;

  useEffect(() => {
    if (selectedPostFull) {
      const whoCanSee = selectedPostFull.whoCanSee || "everyone";
      const whoCanComment = selectedPostFull.whoCanComment || "everyone";
      setPrivacySettings({
        whoCanSee,
        whoCanComment,
      });
      effectiveSetShowSettingsMenu(false);
      effectiveSetShowPrivacySettings(false);
    }
  }, [selectedPostFull, effectiveSetShowSettingsMenu, effectiveSetShowPrivacySettings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideSettingsMenu = settingsMenuRef.current?.contains(event.target);
      const isClickInsidePrivacySettings = privacySettingsRef.current?.contains(event.target);
      const isClickInsideDeleteMenu = showDeleteMenu && 
        deleteMenuRefs.current[showDeleteMenu]?.contains(event.target);

      if (!isClickInsideSettingsMenu && !isClickInsidePrivacySettings) {
        effectiveSetShowSettingsMenu(false);
        effectiveSetShowPrivacySettings(false);
      }

      if (showDeleteMenu && !isClickInsideDeleteMenu) {
        setShowDeleteMenu(null);
      }
    };

    if (effectiveShowSettingsMenu || effectiveShowPrivacySettings || showDeleteMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [effectiveShowSettingsMenu, effectiveShowPrivacySettings, showDeleteMenu, effectiveSetShowSettingsMenu, effectiveSetShowPrivacySettings]);

  const handleUpdatePrivacy = async () => {
    if (!selectedPostFull || !isPostOwner) return;

    try {
      await updatePost({
        postId: selectedPostFull.id,
        privacySettings,
      }).unwrap();

      toast.success("Đã cập nhật cài đặt quyền riêng tư");
      effectiveSetShowPrivacySettings(false);
      effectiveSetShowSettingsMenu(false);
    } catch (error) {
      toast.error(error?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleOpenPrivacySettings = () => {
    effectiveSetShowPrivacySettings(true);
    effectiveSetShowSettingsMenu(false);
  };

  const handleSubmitComment = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!commentText.trim() || !selectedPostFull || isCommenting) return;

    const content = commentText.trim();
    setCommentText("");

    try {
      await createComment({
        postId: isRepost ? undefined : selectedPostFull.id,
        repostId: isRepost ? repostId : undefined,
        content,
      }).unwrap();

      toast.success("Đã thêm bình luận");
      refetchComments();
    } catch (error) {
      toast.error(error?.data?.message || "Thêm bình luận thất bại");
      setCommentText(content);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const confirmed = await confirmToast("Bạn có chắc chắn muốn xóa bình luận này?");
      
      if (!confirmed) {
        setShowDeleteMenu(null);
        return;
      }

      await deleteComment({
        commentId,
        postId: isRepost ? undefined : selectedPostFull.id,
        repostId: isRepost ? repostId : undefined,
      }).unwrap();

      toast.success("Đã xóa bình luận");
      refetchComments();
      setShowDeleteMenu(null);
    } catch (error) {
      toast.error(error?.data?.message || "Xóa bình luận thất bại");
      setShowDeleteMenu(null);
    }
  };

  const handleToggleLike = async (e) => {
    e?.stopPropagation();
    if (!selectedPostFull) return;

    try {
      await createOrUpdateReaction({
        targetId: isRepost ? repostId : selectedPostFull.id,
        targetType: isRepost ? "REPOST" : "POST",
        type: "LIKE",
      }).unwrap();

      refetchMyReaction();
    } catch (error) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPostFull?.id) return;

    const confirmed = await confirmToast("Bạn có chắc chắn muốn xóa bài viết này?");
    
    if (confirmed) {
      try {
        await deletePost(selectedPostFull.id).unwrap();
        toast.success("Đã xóa bài viết");
        onClose();
      } catch (error) {
        toast.error(error?.data?.message || "Xóa bài viết thất bại");
      }
    }
  };

  const handleClose = () => {
    setCommentText("");
    effectiveSetShowSettingsMenu(false);
    effectiveSetShowPrivacySettings(false);
    
    if (postId) {
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: postId }]));
    }
    
    onClose();
  };

  if (!postId || !selectedPostFull) return null;

  return (
    <div
      className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg overflow-hidden max-w-5xl w-full shadow-2xl flex border border-gray-300"
        style={{ maxHeight: "95vh", height: "95vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center bg-black min-h-[800px]">
          {selectedPostFull.media?.[0]?.mediaUrl ? (
            <img
              src={selectedPostFull.media[0].mediaUrl}
              alt={selectedPostFull.content || "Post"}
              className="w-full h-auto max-h-[95vh] object-contain"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <MessageCircle size={64} />
            </div>
          )}
        </div>
        <div className="w-96 p-4 border-l border-gray-300 flex flex-col h-full">
          <div className="flex flex-col gap-2  pb-4 border-b border-gray-300 flex-shrink-0">
            <div className="flex items-center gap-3">
            <img
              src={
                selectedPostFull.user?.avatarUrl ||
                "/images/avatar-IG-mac-dinh-1.jpg"
              }
              alt={selectedPostFull.user?.username}
              className="w-8 h-8 rounded-full object-cover"
            />
              <div className="flex-1">
                <span className="font-semibold">
              {selectedPostFull.user?.username}
            </span>
                {selectedPostFull.createdAt && (
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(
                      selectedPostFull.createdAt
                    ).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-700" />
            </button>
            {isPostOwner && (
              <div className="relative" ref={settingsMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    effectiveSetShowSettingsMenu(!effectiveShowSettingsMenu);
                    effectiveSetShowPrivacySettings(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                >
                  •••
                </button>
                {effectiveShowSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[250px] z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPrivacySettings();
                      }}
                      className="w-full text-left px-5 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Cài đặt quyền riêng tư
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        effectiveSetShowSettingsMenu(false);
                        await handleDeletePost();
                      }}
                      disabled={isDeletingPost}
                      className="w-full text-left px-5 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <X size={16} />
                      Xóa bài viết
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
            {selectedPostFull.content && (
              <p className="text-sm ml-11">
                {selectedPostFull.content}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mb-4 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              {loadingComments ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Đang tải bình luận...
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const isCommentOwner = comment.userId === currentUser?.id;
                    return (
                      <div 
                        key={comment.id} 
                        className="flex gap-3 group"
                        onMouseEnter={() => setHoveredCommentId(comment.id)}
                        onMouseLeave={() => {
                          if (showDeleteMenu !== comment.id) {
                            setHoveredCommentId(null);
                          }
                        }}
                      >
                      <img
                        src={
                          comment.user?.avatarUrl ||
                          "/images/avatar-IG-mac-dinh-1.jpg"
                        }
                        alt={comment.user?.username}
                        className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                      />
                        <div className="flex-1 relative">
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.username}
                            </span>{" "}
                            <span className="text-gray-700">
                              {comment.content}
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            comment.createdAt
                          ).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                          {comment._count?.replies > 0 && (
                            <> • {comment._count.replies} phản hồi</>
                          )}
                        </p>
                          {isCommentOwner && hoveredCommentId === comment.id && (
                            <div className="absolute right-0 top-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteMenu(showDeleteMenu === comment.id ? null : comment.id);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                              >
                                <MoreHorizontal size={16} className="text-gray-500" />
                              </button>
                              {showDeleteMenu === comment.id && (
                                <div 
                                  ref={(el) => {
                                    if (el) {
                                      deleteMenuRefs.current[comment.id] = el;
                                    } else {
                                      delete deleteMenuRefs.current[comment.id];
                                    }
                                  }}
                                  className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100] min-w-[120px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      await handleDeleteComment(comment.id);
                                    }}
                                    disabled={isDeletingComment}
                                    type="button"
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <X size={14} />
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Chưa có bình luận nào
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-3 text-gray-700 flex-shrink-0 border-b border-gray-300 pb-3">
            <button
              onClick={handleToggleLike}
              disabled={isReacting || loadingMyReaction}
              className={`flex items-center gap-1 transition ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "hover:text-gray-900"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart
                size={22}
                fill={isLiked ? "currentColor" : "none"}
                className="transition"
              />
            </button>
            <MessageCircle
              size={22}
              className="hover:text-gray-900 cursor-pointer transition"
            />
            <Share2
              size={22}
              className="hover:text-gray-900 cursor-pointer transition"
            />
          </div>

          <div className="text-sm text-gray-700 flex justify-between mb-3 flex-shrink-0">
            <p className="font-semibold text-gray-900">
              {displayReactionCount} lượt thích
            </p>
            <p className="text-gray-600">
              {displayCommentCount} bình luận
            </p>
          </div>

          <div className="flex-shrink-0">
            <form
              onSubmit={handleSubmitComment}
              onClick={(e) => e.stopPropagation()}
              className="flex gap-2 items-start"
            >
              <img
                src={
                  currentUser?.avatarUrl ||
                  "/images/avatar-IG-mac-dinh-1.jpg"
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
                    setCommentText(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment(e);
                    }
                  }}
                  placeholder="Thêm bình luận..."
                  className="w-full px-3 pr-10 py-2 text-sm border-b border-gray-300 focus:outline-none focus:border-gray-900 transition"
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

          {effectiveShowPrivacySettings && isPostOwner && (
            <div
              ref={privacySettingsRef}
              className="mt-4 pt-4 border-t border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Ai có thể xem?</p>
                  <div className="relative">
                    <select
                      value={privacySettings.whoCanSee}
                      onChange={(e) => {
                        e.stopPropagation();
                        setPrivacySettings({
                          ...privacySettings,
                          whoCanSee: e.target.value,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8"
                    >
                      <option value="everyone">Công khai - Mọi người có thể xem</option>
                      <option value="followers">Người theo dõi - Chỉ người theo dõi bạn</option>
                      <option value="nobody">Riêng tư - Chỉ bạn mới thấy</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Ai có thể bình luận?</p>
                  <div className="relative">
                    <select
                      value={privacySettings.whoCanComment}
                      onChange={(e) => {
                        e.stopPropagation();
                        setPrivacySettings({
                          ...privacySettings,
                          whoCanComment: e.target.value,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8"
                    >
                      <option value="everyone">Mọi người - Ai cũng có thể bình luận</option>
                      <option value="followers">Người theo dõi - Chỉ người theo dõi bạn</option>
                      <option value="nobody">Tắt - Không ai có thể bình luận</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdatePrivacy();
                    }}
                    disabled={isUpdatingPost}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isUpdatingPost ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      effectiveSetShowPrivacySettings(false);
                      setPrivacySettings({
                        whoCanSee: selectedPostFull.whoCanSee || "everyone",
                        whoCanComment: selectedPostFull.whoCanComment || "everyone",
                      });
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

