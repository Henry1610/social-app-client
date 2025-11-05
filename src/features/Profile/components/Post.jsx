import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, X, Bookmark, BookmarkCheck, Send } from "lucide-react";
import { useGetReactionsQuery, useCreateOrUpdateReactionMutation } from "../../reaction/reactionApi";
import { postApi, useSavePostMutation, useUnsavePostMutation } from "../../post/postApi";
import { useRepostPostMutation, useUndoRepostMutation } from "../../repost/repostApi";
import { useGetCommentsByPostQuery, useCreateCommentMutation } from "../../comment/commentApi";
import ModalUserItem from "./ModalUserItem";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";
import { toast } from "sonner";
import { usePostView } from "../../../hooks/usePostView";
function Post({
  id,
  user,
  media = [],
  content = "",
  createdAt,
  likes: initialLikes = 0,
  commentsCount = 0,
  repostsCount = 0,
  savesCount = 0,
  isLiked: initialIsLiked = false,
  isSaved: initialIsSaved = false,
  isReposted: initialIsReposted = false,
  isRepost = false,
  repostId = null,
  repostedBy = null,
  repostContent = null,
  originalLikes = 0,
  originalCommentsCount = 0,
  originalRepostsCount = 0,
  originalSavesCount = 0,
  originalIsLiked: initialOriginalIsLiked = false,
  originalIsSaved: initialOriginalIsSaved = false,
  originalIsReposted: initialOriginalIsReposted = false,
  originalCreatedAt = null,
  onOpenPostModal,
}) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showOriginalCommentsModal, setShowOriginalCommentsModal] = useState(false);
  const [showOriginalLikesModal, setShowOriginalLikesModal] = useState(false);
  const [showOriginalRepostModal, setShowOriginalRepostModal] = useState(false);
  const [newRepostContent, setNewRepostContent] = useState("");
  const [originalRepostContent, setOriginalRepostContent] = useState("");
  const [commentText, setCommentText] = useState("");
  const [originalCommentText, setOriginalCommentText] = useState("");
  const [localIsLiked, setLocalIsLiked] = useState(initialIsLiked);
  const [localLikesCount, setLocalLikesCount] = useState(initialLikes);
  const [localIsSaved, setLocalIsSaved] = useState(initialIsSaved);
  const [localIsReposted, setLocalIsReposted] = useState(initialIsReposted);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount);
  
  // State cho bài gốc trong repost
  const [originalIsLiked, setOriginalIsLiked] = useState(initialOriginalIsLiked);
  const [originalLikesCount, setOriginalLikesCount] = useState(originalLikes);
  const [originalIsSaved, setOriginalIsSaved] = useState(initialOriginalIsSaved);
  const [originalIsReposted, setOriginalIsReposted] = useState(initialOriginalIsReposted);
  const [originalCommentsCountLocal, setOriginalCommentsCountLocal] = useState(originalCommentsCount);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  
  // Dùng repostId nếu là repost, không thì dùng id (postId)
  const targetId = isRepost && repostId ? repostId : id;
  const targetType = isRepost ? "REPOST" : "POST";
  const commentTargetId = isRepost && repostId ? repostId : id;
  const isRepostComment = isRepost && repostId;

  // Track post/repost view khi scroll qua
  // Nếu là repost, track với repostId; nếu là post, track với id
  const postViewRef = usePostView(isRepost ? null : id, isRepost ? repostId : null, true, 0.3, 1000); // Track khi 30% visible, delay 1s

  const { data: reactionsData, isLoading: loadingReactions } = useGetReactionsQuery(
    { targetId, targetType },
    { skip: !showLikesModal || !targetId }
  );

  const [createOrUpdateReaction, { isLoading: isReacting }] = useCreateOrUpdateReactionMutation();
  const [savePost, { isLoading: isSaving }] = useSavePostMutation();
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();
  const [repostPost, { isLoading: isReposting }] = useRepostPostMutation();
  const [undoRepost, { isLoading: isUndoingRepost }] = useUndoRepostMutation();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  
  const { data: commentsData, isLoading: loadingComments, refetch: refetchComments } = useGetCommentsByPostQuery(
    { postId: isRepostComment ? null : commentTargetId, repostId: isRepostComment ? commentTargetId : null, page: 1, limit: 50, sortBy: "desc" },
    { skip: !showCommentsModal || !commentTargetId }
  );
  
  // Comments cho bài gốc trong repost
  const { data: originalCommentsData, isLoading: loadingOriginalComments, refetch: refetchOriginalComments } = useGetCommentsByPostQuery(
    { postId: isRepost ? id : null, repostId: null, page: 1, limit: 50, sortBy: "desc" },
    { skip: !showOriginalCommentsModal || !isRepost || !id }
  );
  
  // Reactions cho bài gốc trong repost
  const { data: originalReactionsData, isLoading: loadingOriginalReactions } = useGetReactionsQuery(
    { targetId: id, targetType: "POST" },
    { skip: !showOriginalLikesModal || !isRepost || !id }
  );
  
  const comments = commentsData?.comments || [];
  const originalComments = originalCommentsData?.comments || [];
  const originalReactions = originalReactionsData?.reactions || [];
  const reactions = reactionsData?.reactions || [];
  
  // Sync local state với props khi props thay đổi
  useEffect(() => {
    setLocalIsLiked(initialIsLiked);
    setLocalLikesCount(initialLikes);
    setLocalIsSaved(initialIsSaved);
    setLocalIsReposted(initialIsReposted);
    setLocalCommentsCount(commentsCount);
    
    // Sync state cho bài gốc
    if (isRepost) {
      setOriginalIsLiked(initialOriginalIsLiked);
      setOriginalLikesCount(originalLikes);
      setOriginalIsSaved(initialOriginalIsSaved);
      setOriginalIsReposted(initialOriginalIsReposted);
      setOriginalCommentsCountLocal(originalCommentsCount);
    }
  }, [initialIsLiked, initialLikes, initialIsSaved, initialIsReposted, commentsCount, isRepost, initialOriginalIsLiked, originalLikes, initialOriginalIsSaved, initialOriginalIsReposted, originalCommentsCount]);

  const isLiked = localIsLiked;
  const isSaved = localIsSaved;
  const isReposted = localIsReposted;
  const isSavingPost = isSaving || isUnsaving;
  const isRepostingPost = isReposting || isUndoingRepost;

  const handleSubmitComment = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!commentText.trim() || (!id && !repostId) || isCommenting) return;

    const content = commentText.trim();
    setCommentText("");

    try {
      await createComment({
        postId: isRepostComment ? null : commentTargetId,
        repostId: isRepostComment ? commentTargetId : null,
        content,
      }).unwrap();

      toast.success("Đã thêm bình luận");
      setLocalCommentsCount(prev => prev + 1);
      refetchComments();
    } catch (error) {
      toast.error(error?.data?.message || "Thêm bình luận thất bại");
      setCommentText(content);
    }
  };

  const handleToggleLike = async (e) => {
    e?.stopPropagation();
    if (!targetId || isReacting) return;

    // Optimistic update - lưu giá trị cũ để revert nếu có lỗi
    const wasLiked = isLiked;
    const oldLikeCount = localLikesCount;
    const newLikeCount = wasLiked ? oldLikeCount - 1 : oldLikeCount + 1;
    setLocalIsLiked(!wasLiked);
    setLocalLikesCount(newLikeCount);

    try {
      await createOrUpdateReaction({
        targetId,
        targetType,
        type: "LIKE",
      }).unwrap();

      // Không invalidate feed để tránh post biến mất
      // Chỉ cập nhật local state, không cần refetch feed
    } catch (error) {
      // Revert optimistic update nếu có lỗi
      setLocalIsLiked(wasLiked);
      setLocalLikesCount(oldLikeCount);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggleSave = async (e) => {
    e?.stopPropagation();
    if (!id || isSavingPost) return;

    // Optimistic update
    const wasSaved = isSaved;
    setLocalIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await unsavePost(id).unwrap();
        toast.success("Đã bỏ lưu bài viết");
      } else {
        await savePost(id).unwrap();
        toast.success("Đã lưu bài viết");
      }

      // Không invalidate feed để tránh post biến mất
      // Chỉ invalidate post cụ thể nếu cần
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
    } catch (error) {
      // Revert optimistic update nếu có lỗi
      setLocalIsSaved(wasSaved);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggleRepost = async (e) => {
    e?.stopPropagation();
    if (!id || isRepostingPost) return;

    // Nếu đã repost rồi thì hủy repost
    if (isReposted) {
      const wasReposted = isReposted;
      setLocalIsReposted(false);

      try {
        await undoRepost(id).unwrap();
        toast.success("Đã hủy đăng lại");
        // Không invalidate feed để tránh post biến mất
        dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
      } catch (error) {
        setLocalIsReposted(wasReposted);
        toast.error(error?.data?.message || "Có lỗi xảy ra");
      }
      return;
    }

    // Nếu chưa repost thì mở modal để nhập content
    setShowRepostModal(true);
  };

  const handleConfirmRepost = async () => {
    if (!id || isRepostingPost) return;

    const wasReposted = isReposted;
    setLocalIsReposted(true);

    try {
      await repostPost({ postId: id, content: newRepostContent.trim() }).unwrap();
      toast.success("Đã đăng lại bài viết");
      setShowRepostModal(false);
      setNewRepostContent("");
      // Không invalidate feed để tránh post biến mất
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
    } catch (error) {
      setLocalIsReposted(wasReposted);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handlers cho bài gốc trong repost
  const handleOriginalToggleLike = async (e) => {
    e?.stopPropagation();
    if (!id || isReacting) return;

    const wasLiked = originalIsLiked;
    const oldLikeCount = originalLikesCount;
    const newLikeCount = wasLiked ? oldLikeCount - 1 : oldLikeCount + 1;
    setOriginalIsLiked(!wasLiked);
    setOriginalLikesCount(newLikeCount);

    try {
      await createOrUpdateReaction({
        targetId: id,
        targetType: "POST",
        type: "LIKE",
      }).unwrap();
    } catch (error) {
      setOriginalIsLiked(wasLiked);
      setOriginalLikesCount(oldLikeCount);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleOriginalToggleSave = async (e) => {
    e?.stopPropagation();
    if (!id || isSavingPost) return;

    const wasSaved = originalIsSaved;
    setOriginalIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await unsavePost(id).unwrap();
        toast.success("Đã bỏ lưu bài viết");
      } else {
        await savePost(id).unwrap();
        toast.success("Đã lưu bài viết");
      }
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
    } catch (error) {
      setOriginalIsSaved(wasSaved);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleOriginalToggleRepost = async (e) => {
    e?.stopPropagation();
    if (!id || isRepostingPost) return;

    if (originalIsReposted) {
      const wasReposted = originalIsReposted;
      setOriginalIsReposted(false);

      try {
        await undoRepost(id).unwrap();
        toast.success("Đã hủy đăng lại");
        dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
      } catch (error) {
        setOriginalIsReposted(wasReposted);
        toast.error(error?.data?.message || "Có lỗi xảy ra");
      }
      return;
    }

    setShowOriginalRepostModal(true);
  };

  const handleConfirmOriginalRepost = async () => {
    if (!id || isRepostingPost) return;

    const wasReposted = originalIsReposted;
    setOriginalIsReposted(true);

    try {
      await repostPost({ postId: id, content: originalRepostContent.trim() }).unwrap();
      toast.success("Đã đăng lại bài viết");
      setShowOriginalRepostModal(false);
      setOriginalRepostContent("");
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
    } catch (error) {
      setOriginalIsReposted(wasReposted);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleSubmitOriginalComment = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!originalCommentText.trim() || !id || isCommenting) return;

    const content = originalCommentText.trim();
    setOriginalCommentText("");

    try {
      await createComment({
        postId: id,
        repostId: null,
        content,
      }).unwrap();

      toast.success("Đã thêm bình luận");
      setOriginalCommentsCountLocal(prev => prev + 1);
      refetchOriginalComments();
    } catch (error) {
      toast.error(error?.data?.message || "Thêm bình luận thất bại");
      setOriginalCommentText(content);
    }
  };

  const timeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000; // giây
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)} ngày`;
  };

  return (
    <article ref={postViewRef} className="mb-6 border-b border-gray-200 max-w-[500px] mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img
            src={isRepost && repostedBy ? (repostedBy.avatarUrl || repostedBy.avatar || "/images/avatar-IG-mac-dinh-1.jpg") : (user?.avatar || "/images/avatar-IG-mac-dinh-1.jpg")}
            alt={isRepost && repostedBy ? repostedBy.username : user?.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col">
            {isRepost && repostedBy ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/${repostedBy.username}`)}
                  className="font-semibold text-sm hover:underline"
                >
                  {repostedBy.username}
                </button>
                <Repeat2 size={14} className="text-gray-500" />
                <span className="text-gray-500 text-sm">
                  • {timeAgo(createdAt)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/${user?.username}`)}
                  className="font-semibold text-sm hover:underline"
                >
                  {user?.username}
                </button>
                {user?.verified && (
                  <svg
                    className="w-3 h-3 text-blue-500 fill-current"
                    viewBox="0 0 40 40"
                  >
                    <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
                  </svg>
                )}
                <span className="text-gray-500 text-sm">
                  • {timeAgo(createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Repost Layout */}
      {isRepost && repostedBy ? (
        <>
          {/* Repost Content */}
          {repostContent && (
            <div className="mb-3 text-sm text-gray-700">{repostContent}</div>
          )}
          
          {/* Original Post - Nằm trong khung */}
          <div className="border border-gray-300 rounded-lg p-3 mb-3">
            <div className="flex gap-2 mb-2">
              <img
                src={user?.avatar || "/images/avatar-IG-mac-dinh-1.jpg"}
                alt={user?.username}
                className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/${user?.username}`)}
                  className="text-sm font-semibold hover:underline"
                >
                  {user?.username}
                </button>
                <span className="text-gray-500 text-sm">
                  • {timeAgo(originalCreatedAt || createdAt)}
                </span>
              </div>
            </div>
            {content && (
              <p className="text-sm mb-2">{content}</p>
            )}
            {media.length > 0 && (
              <div className="mt-2">
                {media[0].type === 'video' ? (
                  <video
                    src={media[0].url}
                    className="w-full aspect-square object-cover rounded-md"
                    controls
                  />
                ) : (
                  <img
                    src={media[0].url}
                    alt="Post media"
                    className="w-full aspect-square object-cover rounded-md"
                  />
                )}
              </div>
            )}
            
            {/* Action buttons cho bài gốc */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <button
                  onClick={handleOriginalToggleLike}
                  disabled={isReacting}
                  className={`transition ${
                    originalIsLiked
                      ? "text-red-500 hover:text-red-600"
                      : "hover:text-gray-900"
                  } ${isReacting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Heart
                    size={18}
                    fill={originalIsLiked ? "currentColor" : "none"}
                    className="transition"
                  />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOriginalCommentsModal(true);
                  }}
                  className="hover:text-gray-900 transition"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={handleOriginalToggleRepost}
                  disabled={isRepostingPost}
                  className={`transition ${
                    originalIsReposted
                      ? "text-green-500 hover:text-green-600"
                      : "hover:text-gray-900"
                  } ${isRepostingPost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Repeat2
                    size={18}
                    fill={originalIsReposted ? "currentColor" : "none"}
                    className="transition"
                  />
                </button>
              </div>
              <button
                onClick={handleOriginalToggleSave}
                disabled={isSavingPost}
                className={`transition ${
                  originalIsSaved
                    ? "text-blue-500 hover:text-blue-600"
                    : "hover:text-gray-500"
                } ${isSavingPost ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {originalIsSaved ? (
                  <BookmarkCheck size={18} className="transition" />
                ) : (
                  <Bookmark size={18} className="transition" />
                )}
              </button>
            </div>

            {/* Stats của bài gốc */}
            {(originalLikesCount > 0 || originalCommentsCountLocal > 0 || originalSavesCount > 0 || originalRepostsCount > 0) && (
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                {originalLikesCount > 0 && (
                  <button
                    onClick={() => setShowOriginalLikesModal(true)}
                    className="font-semibold hover:underline cursor-pointer"
                  >
                    {originalLikesCount.toLocaleString()} lượt thích
                  </button>
                )}
                {originalCommentsCountLocal > 0 && (
                  <button
                    onClick={() => setShowOriginalCommentsModal(true)}
                    className="hover:underline cursor-pointer"
                  >
                    {originalCommentsCountLocal.toLocaleString()} bình luận
                  </button>
                )}
                {originalSavesCount > 0 && (
                  <span>{originalSavesCount.toLocaleString()} lượt lưu</span>
                )}
                {originalRepostsCount > 0 && (
                  <span>{originalRepostsCount.toLocaleString()} lượt đăng lại</span>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Normal Post Content */}
          {content && (
            <p className="text-sm mb-3">{content}</p>
          )}
          
          {/* Post Image / Carousel */}
          {media.length > 0 && (
            <div className="relative mb-3 mx-auto">
              <img
                src={media[0].url}
                alt="post"
                className="w-full aspect-square object-cover rounded-md"
              />
              {media.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {media.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === 0 ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700">
          <button
            onClick={handleToggleLike}
            disabled={isReacting}
            className={`transition ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "hover:text-gray-900"
            } ${isReacting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart
              size={22}
              fill={isLiked ? "currentColor" : "none"}
              className="transition"
            />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentsModal(true);
            }}
            className="hover:text-gray-900 transition"
          >
            <MessageCircle size={22} />
          </button>
          {!isRepost && (
            <button
              onClick={handleToggleRepost}
              disabled={isRepostingPost}
              className={`transition ${
                isReposted
                  ? "text-green-500 hover:text-green-600"
                  : "hover:text-gray-900"
              } ${isRepostingPost ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Repeat2
                size={22}
                fill={isReposted ? "currentColor" : "none"}
                className="transition"
              />
            </button>
          )}
        </div>
        {!isRepost && (
          <button
            onClick={handleToggleSave}
            disabled={isSavingPost}
            className={`flex items-center gap-1 transition ${
              isSaved
                ? "text-blue-500 hover:text-blue-600"
                : "hover:text-gray-500"
            } ${isSavingPost ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaved ? (
              <BookmarkCheck size={22} className="transition" />
            ) : (
              <Bookmark size={22} className="transition" />
            )}
            {savesCount > 0 && (
              <span className="text-sm font-medium">
                {savesCount.toLocaleString()}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Likes */}
      {localLikesCount > 0 && (
        <div className="mb-1">
          <button
            onClick={() => setShowLikesModal(true)}
            className="font-semibold text-sm hover:underline cursor-pointer"
          >
            {localLikesCount.toLocaleString()} lượt thích
          </button>
        </div>
      )}

      {/* Comments */}
      {localCommentsCount > 0 ? (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowCommentsModal(true);
          }}
          className="text-gray-500 text-sm mb-3 hover:underline cursor-pointer"
        >
          Xem tất cả {localCommentsCount} bình luận
        </button>
      ) : (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowCommentsModal(true);
          }}
          className="text-gray-500 text-sm mb-3 hover:underline cursor-pointer"
        >
          Thêm bình luận đầu tiên
        </button>
      )}

      {/* Reposts Count */}
      {!isRepost && repostsCount > 0 && (
        <div className="mb-3">
          <span className="text-gray-500 text-sm">
            {repostsCount.toLocaleString()} lượt đăng lại
          </span>
        </div>
      )}

      {/* Modal danh sách người thích */}
      {showLikesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg min-h-[400px] max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center pt-2 px-2">
              <div className="w-6"></div>
              <h3 className="text-base font-semibold">Người đã thích</h3>
              <button
                onClick={() => setShowLikesModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loadingReactions ? (
                <div className="text-center py-10 text-gray-500">
                  Đang tải...
                </div>
              ) : reactions.length > 0 ? (
                <div>
                  {reactions.map((reaction) => (
                    <ModalUserItem
                      key={`${reaction.userId}-${reaction.id}`}
                      user={reaction.user}
                      currentUserId={currentUser?.id}
                      onClose={() => setShowLikesModal(false)}
                      isFollower={false}
                      isSelfProfile={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Chưa có ai thích bài viết này
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {showRepostModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRepostModal(false);
              setNewRepostContent("");
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Đăng lại bài viết</h3>
              <button
                onClick={() => {
                  setShowRepostModal(false);
                  setNewRepostContent("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={newRepostContent}
              onChange={(e) => setNewRepostContent(e.target.value)}
              placeholder="Thêm suy nghĩ của bạn (tùy chọn)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {newRepostContent.length}/500
              </span>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRepostModal(false);
                  setNewRepostContent("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRepost}
                disabled={isRepostingPost}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isRepostingPost ? "Đang đăng lại..." : "Đăng lại"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCommentsModal(false);
              setCommentText("");
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
                onClick={() => {
                  setShowCommentsModal(false);
                  setCommentText("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingComments ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Đang tải bình luận...
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={
                          comment.user?.avatarUrl ||
                          "/images/avatar-IG-mac-dinh-1.jpg"
                        }
                        alt={comment.user?.username}
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.username}
                            </span>{" "}
                            <span className="text-gray-700">
                              {comment.content}
                            </span>
                          </p>
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
              <form
                onSubmit={handleSubmitComment}
                className="flex gap-2 items-center"
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
      )}

      {/* Original Post Likes Modal */}
      {showOriginalLikesModal && isRepost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg min-h-[400px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pt-2 px-2">
              <div className="w-6"></div>
              <h3 className="text-base font-semibold">Người đã thích</h3>
              <button
                onClick={() => setShowOriginalLikesModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingOriginalReactions ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
              ) : originalReactions.length > 0 ? (
                <div>
                  {originalReactions.map((reaction) => (
                    <ModalUserItem
                      key={`${reaction.userId}-${reaction.id}`}
                      user={reaction.user}
                      currentUserId={currentUser?.id}
                      onClose={() => setShowOriginalLikesModal(false)}
                      isFollower={false}
                      isSelfProfile={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Chưa có ai thích bài viết này
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Original Post Comments Modal */}
      {showOriginalCommentsModal && isRepost && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOriginalCommentsModal(false);
              setOriginalCommentText("");
            }
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Bình luận</h3>
              <button
                onClick={() => {
                  setShowOriginalCommentsModal(false);
                  setOriginalCommentText("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingOriginalComments ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Đang tải bình luận...
                </div>
              ) : originalComments.length > 0 ? (
                <div className="space-y-4">
                  {originalComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={
                          comment.user?.avatarUrl ||
                          "/images/avatar-IG-mac-dinh-1.jpg"
                        }
                        alt={comment.user?.username}
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.username}
                            </span>{" "}
                            <span className="text-gray-700">
                              {comment.content}
                            </span>
                          </p>
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
            <div className="p-4 border-t border-gray-200">
              <form
                onSubmit={handleSubmitOriginalComment}
                className="flex gap-2 items-center"
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
                    value={originalCommentText}
                    onChange={(e) => {
                      e.stopPropagation();
                      setOriginalCommentText(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitOriginalComment(e);
                      }
                    }}
                    placeholder="Thêm bình luận..."
                    className="w-full px-3 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    disabled={isCommenting}
                  />
                  <button
                    type="submit"
                    disabled={!originalCommentText.trim() || isCommenting}
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
      )}

      {/* Original Post Repost Modal */}
      {showOriginalRepostModal && isRepost && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOriginalRepostModal(false);
              setOriginalRepostContent("");
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Đăng lại bài viết</h3>
              <button
                onClick={() => {
                  setShowOriginalRepostModal(false);
                  setOriginalRepostContent("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={originalRepostContent}
              onChange={(e) => setOriginalRepostContent(e.target.value)}
              placeholder="Thêm suy nghĩ của bạn (tùy chọn)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {originalRepostContent.length}/500
              </span>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOriginalRepostModal(false);
                  setOriginalRepostContent("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOriginalRepost}
                disabled={isRepostingPost}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isRepostingPost ? "Đang đăng lại..." : "Đăng lại"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default Post;
