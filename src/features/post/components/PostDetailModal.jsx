import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  postApi,
  useSavePostMutation,
  useUnsavePostMutation,
} from "../api/postApi";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "../../comment/api/commentApi";
import CommentItem from "../../comment/components/CommentItem";
import {
  useGetMyReactionQuery,
  useCreateOrUpdateReactionMutation,
  useGetReactionStatsQuery,
} from "../../reaction/api/reactionApi";
import {
  useRepostPostMutation,
  useUndoRepostMutation,
  useGetRepostByIdQuery,
} from "../../repost/api/repostApi";
import {
  X,
  Send,
  CheckCircle,
  ChevronDown,
  Settings,
  Image,
  MessageCircle,
  ArrowLeft,
  Repeat2,
} from "lucide-react";
import { toast } from "sonner";
import confirmToast from "../../../components/common/confirmToast";
import RepostModal from "../../repost/components/RepostModal";
import { useDispatch } from "react-redux";
import PostMediaViewer from "./PostMediaViewer";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";

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
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [commentText, setCommentText] = useState("");
  const [privacySettings, setPrivacySettings] = useState({
    whoCanSee: "everyone",
    whoCanComment: "everyone",
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostContent, setRepostContent] = useState("");
  const [activeTab, setActiveTab] = useState("image"); // "image" | "comments"
  const settingsMenuRef = useRef(null);
  const privacySettingsRef = useRef(null);

  const isRepost = !!repostId;

  // Fetch repost nếu chỉ có repostId (đã bao gồm post gốc)
  const { data: repostData, isLoading: loadingRepost } = useGetRepostByIdQuery(repostId || 0, {
    skip: !repostId || !!postId,
  });

  // Fetch post nếu chỉ có postId
  const { data: fullPostData, isLoading: loadingPost } = useGetPostByIdQuery(postId || 0, {
    skip: !postId || !!repostId,
  });

  // Lấy post từ repost hoặc từ query trực tiếp
  const selectedPostFull = isRepost ? repostData?.repost?.post : fullPostData?.post;
  const isPostOwner =
    selectedPostFull && currentUser?.id === selectedPostFull.userId;

  // Khi là repost, lấy createdAt từ repost; user thì từ post gốc, repostedBy từ repost
  const displayUser = selectedPostFull?.user; // User của post gốc
  const repostedByUser = isRepost && repostData?.repost?.user ? repostData.repost.user : null; // User của người repost
  const displayCreatedAt = isRepost && repostData?.repost?.createdAt ? repostData.repost.createdAt : selectedPostFull?.createdAt;
  const displayRepostContent = isRepost && repostData?.repost?.content ? repostData.repost.content : null; // Content của repost
  
  // Đảm bảo có dữ liệu trước khi render
  const isLoading = isRepost ? loadingRepost : loadingPost;
  
  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch: refetchComments,
  } = useGetCommentsByPostQuery(
    {
      postId: isRepost ? undefined : selectedPostFull?.id || 0,
      repostId: isRepost ? repostId : undefined,
      page: 1,
      limit: 10,
      sortBy: "desc",
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
      targetId: isRepost ? repostId : selectedPostFull?.id || 0,
      targetType: isRepost ? "REPOST" : "POST",
    },
    { skip: !selectedPostFull?.id || (isRepost && !repostId) }
  );

  const myReaction = myReactionData?.reaction;
  const isLiked = !!myReaction;

  // Fetch reaction count của repost nếu là repost (dùng stats thay vì fetch toàn bộ reactions)
  const { data: repostStatsData } = useGetReactionStatsQuery(
    { targetId: repostId, targetType: "REPOST" },
    { skip: !isRepost || !repostId }
  );

  // Stats để hiển thị: nếu là repost thì dùng stats của repost, không thì dùng stats của post
  const displayReactionCount = isRepost
    ? repostStatsData?.total || 0
    : selectedPostFull?._count?.reactions || 0;
  const displayCommentCount = isRepost
    ? commentsData?.pagination?.totalComments || 0
    : selectedPostFull?._count?.comments || 0;

  const [createOrUpdateReaction, { isLoading: isReacting }] =
    useCreateOrUpdateReactionMutation();
  const [createComment, { isLoading: isCommenting }] =
    useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] =
    useDeleteCommentMutation();
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [savePost, { isLoading: isSaving }] = useSavePostMutation();
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();
  const [repostPost, { isLoading: isReposting }] = useRepostPostMutation();
  const [undoRepost, { isLoading: isUndoingRepost }] = useUndoRepostMutation();

  const effectiveShowSettingsMenu =
    externalShowSettingsMenu !== undefined
      ? externalShowSettingsMenu
      : showSettingsMenu;
  const effectiveSetShowSettingsMenu =
    externalSetShowSettingsMenu || setShowSettingsMenu;
  const effectiveShowPrivacySettings =
    externalShowPrivacySettings !== undefined
      ? externalShowPrivacySettings
      : showPrivacySettings;
  const effectiveSetShowPrivacySettings =
    externalSetShowPrivacySettings || setShowPrivacySettings;

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

      // Check if post is saved
      if (selectedPostFull.isSaved !== undefined) {
        setIsSaved(selectedPostFull.isSaved);
      }

      // Check if post is reposted
      if (selectedPostFull.isRepost !== undefined) {
        setIsReposted(selectedPostFull.isRepost);
      }
    }
  }, [
    selectedPostFull,
    effectiveSetShowSettingsMenu,
    effectiveSetShowPrivacySettings,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideSettingsMenu = settingsMenuRef.current?.contains(
        event.target
      );
      const isClickInsidePrivacySettings = privacySettingsRef.current?.contains(
        event.target
      );

      if (!isClickInsideSettingsMenu && !isClickInsidePrivacySettings) {
        effectiveSetShowSettingsMenu(false);
        effectiveSetShowPrivacySettings(false);
      }
    };

    if (
      effectiveShowSettingsMenu ||
      effectiveShowPrivacySettings
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    effectiveShowSettingsMenu,
    effectiveShowPrivacySettings,
    effectiveSetShowSettingsMenu,
    effectiveSetShowPrivacySettings,
  ]);

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
      const confirmed = await confirmToast(
        "Bạn có chắc chắn muốn xóa bình luận này?"
      );

      if (!confirmed) {
        return;
      }

      await deleteComment({
        commentId,
        postId: isRepost ? undefined : selectedPostFull.id,
        repostId: isRepost ? repostId : undefined,
      }).unwrap();

      toast.success("Đã xóa bình luận");
      refetchComments();
    } catch (error) {
      toast.error(error?.data?.message || "Xóa bình luận thất bại");
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

  const handleToggleSave = async (e) => {
    e?.stopPropagation();
    if (!selectedPostFull || isSaving || isUnsaving) return;

    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await unsavePost(selectedPostFull.id).unwrap();
        toast.success("Đã bỏ lưu bài viết");
      } else {
        await savePost(selectedPostFull.id).unwrap();
        toast.success("Đã lưu bài viết");
      }
      dispatch(
        postApi.util.invalidateTags([{ type: "Post", id: selectedPostFull.id }])
      );
    } catch (error) {
      setIsSaved(wasSaved);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggleRepost = async (e) => {
    e?.stopPropagation();
    if (!selectedPostFull || isReposting || isUndoingRepost) return;

    if (isReposted) {
      const wasReposted = isReposted;
      setIsReposted(false);

      try {
        await undoRepost(selectedPostFull.id).unwrap();
        toast.success("Đã hủy đăng lại");
        dispatch(
          postApi.util.invalidateTags([
            { type: "Post", id: selectedPostFull.id },
          ])
        );
      } catch (error) {
        setIsReposted(wasReposted);
        toast.error(error?.data?.message || "Có lỗi xảy ra");
      }
      return;
    }

    setShowRepostModal(true);
  };

  const handleConfirmRepost = async () => {
    if (!selectedPostFull || isReposting) return;

    const wasReposted = isReposted;
    setIsReposted(true);

    try {
      await repostPost({
        postId: selectedPostFull.id,
        content: repostContent.trim(),
      }).unwrap();
      toast.success("Đã đăng lại bài viết");
      setShowRepostModal(false);
      setRepostContent("");
      dispatch(
        postApi.util.invalidateTags([{ type: "Post", id: selectedPostFull.id }])
      );
    } catch (error) {
      setIsReposted(wasReposted);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPostFull?.id) return;

    const confirmed = await confirmToast(
      "Bạn có chắc chắn muốn xóa bài viết này?"
    );

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
      dispatch(postApi.util.invalidateTags([{ type: "Post", id: postId }]));
    }

    onClose();
  };

  // Cho phép render khi có postId hoặc repostId (và đang fetch)
  if (!postId && !repostId) return null;
  if (isLoading) return null; // Chờ fetch xong
  if (!selectedPostFull) return null; // Chờ fetch post/repost xong

  return (
    <div
      className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-0 md:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg overflow-hidden max-w-5xl w-full h-full md:h-[95vh] md:max-h-[95vh] shadow-2xl flex flex-col md:flex-row border-0 md:border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs cho mobile */}
        <div className="md:hidden flex border-b border-gray-300 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-3 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("image");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition ${
              activeTab === "image"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
            }`}
          >
            <Image size={18} />
            Ảnh
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("comments");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition ${
              activeTab === "comments"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
            }`}
          >
            <MessageCircle size={18} />
            Bình luận
          </button>
        </div>

        {/* Media Viewer - Mobile: chỉ hiển thị khi activeTab === "image", Desktop: luôn hiển thị */}
        <div className={`${activeTab === "image" ? "flex" : "hidden"} md:flex flex-1 md:flex-shrink-0 min-h-0 overflow-hidden flex-col`}>
          {/* Header đơn giản cho tab ảnh */}
          <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-300 bg-white">
            <div className="flex items-center gap-3">
              <img
                src={repostedByUser?.avatarUrl || displayUser?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                alt={repostedByUser?.username || displayUser?.username}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                {isRepost && repostedByUser ? (
                  <>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => navigate(`/${displayUser?.username}`)}
                        className="text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {displayUser?.username}
                      </button>
                      <Repeat2 size={12} className="text-gray-500 flex-shrink-0" />
                      <button
                        onClick={() => navigate(`/${repostedByUser.username}`)}
                        className="text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {repostedByUser.username}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(displayCreatedAt)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {displayUser?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(displayCreatedAt)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Media Viewer */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center mx-2 py-2">
            <PostMediaViewer
              media={selectedPostFull.media}
              content={selectedPostFull.content}
              className="w-full h-full max-w-full max-h-full"
            />
          </div>
        </div>

        {/* Comments Section - Mobile: chỉ hiển thị khi activeTab === "comments", Desktop: luôn hiển thị */}
        <div className={`${activeTab === "comments" ? "flex" : "hidden"} md:flex w-full md:w-96 p-3 md:p-4 md:border-l border-gray-300 flex-col h-full overflow-hidden pb-20 md:pb-4`}>
          <div className="flex flex-col pb-2 border-b border-gray-300 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <PostHeader
                user={displayUser}
                createdAt={displayCreatedAt}
                content={isRepost && displayRepostContent ? displayRepostContent : selectedPostFull.content}
                isRepost={isRepost}
                repostedBy={repostedByUser}
                onNavigate={navigate}
                size="normal"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
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
            </div>
          </div>
          {/* List comments */}
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col min-h-0 mt-2">
            <div className="flex-1 overflow-y-auto">
              {loadingComments ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Đang tải bình luận...
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onDeleteComment={handleDeleteComment}
                      isDeletingComment={isDeletingComment}
                      depth={1}
                      postId={isRepost ? undefined : selectedPostFull?.id}
                      repostId={isRepost ? repostId : undefined}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Chưa có bình luận nào
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 flex-shrink-0 border-b border-gray-300 pb-3">
            <PostActions
              isLiked={isLiked}
              isReposted={isReposted}
              isSaved={isSaved}
              isReacting={isReacting || loadingMyReaction}
              isReposting={isReposting || isUndoingRepost}
              isSaving={isSaving || isUnsaving}
              onToggleLike={handleToggleLike}
              onToggleRepost={handleToggleRepost}
              onToggleSave={handleToggleSave}
              showRepost={!isRepost}
              showSave={!isRepost}
              size={22}
            />
          </div>

          <div className="text-sm text-gray-700 flex justify-between mb-3 flex-shrink-0">
            <p className="font-semibold text-gray-900">
              {displayReactionCount} lượt thích
            </p>
            <p className="text-gray-600">{displayCommentCount} bình luận</p>
          </div>

          <div className="flex-shrink-0">
            <form
              onSubmit={handleSubmitComment}
              onClick={(e) => e.stopPropagation()}
              className="flex gap-2 items-start"
            >
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
                      <option value="everyone">
                        Công khai - Mọi người có thể xem
                      </option>
                      <option value="followers">
                        Người theo dõi - Chỉ người theo dõi bạn
                      </option>
                      <option value="nobody">
                        Riêng tư - Chỉ bạn mới thấy
                      </option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    Ai có thể bình luận?
                  </p>
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
                      <option value="everyone">
                        Mọi người - Ai cũng có thể bình luận
                      </option>
                      <option value="followers">
                        Người theo dõi - Chỉ người theo dõi bạn
                      </option>
                      <option value="nobody">
                        Tắt - Không ai có thể bình luận
                      </option>
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
                        whoCanComment:
                          selectedPostFull.whoCanComment || "everyone",
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

      {/* Repost Modal */}
      <RepostModal
        isOpen={showRepostModal}
        onClose={() => {
          setShowRepostModal(false);
          setRepostContent("");
        }}
        content={repostContent}
        onContentChange={setRepostContent}
        onConfirm={handleConfirmRepost}
        isLoading={isReposting || isUndoingRepost}
        zIndex={60}
      />
    </div>
  );
};

export default PostDetailModal;
