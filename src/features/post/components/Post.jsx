import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostMediaViewer from "./PostMediaViewer";
import PostActions from "./PostActions";
import { useGetReactionsQuery, useCreateOrUpdateReactionMutation } from "../../reaction/api/reactionApi";
import { postApi, useSavePostMutation, useUnsavePostMutation, useUpdatePostMutation } from "../api/postApi";
import { useRepostPostMutation, useUndoRepostMutation } from "../../repost/api/repostApi";
import { useGetCommentsByPostQuery, useCreateCommentMutation, useDeleteCommentMutation } from "../../comment/api/commentApi";
import RepostModal from "../../repost/components/RepostModal";
import LikesModal from "../../reaction/components/LikesModal";
import CommentsModal from "../../comment/components/CommentsModal";
import PostHeader from "./PostHeader";
import OriginalPostContent from "./OriginalPostContent";
import PostSettingsMenu from "./PostSettingsMenu";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";
import { toast } from "sonner";
import { usePostView } from "../hooks/usePostView";
import confirmToast from "../../../components/common/confirmToast";
function Post({
  id,
  user,
  media = [],
  content = "",
  createdAt,
  // Stats và interactions của post/repost hiện tại
  likes: initialLikes = 0,
  commentsCount = 0,
  repostsCount = 0,
  isLiked: initialIsLiked = false,
  // Lưu ý: isSaved và isReposted chỉ dùng cho post thường
  // Nếu có originalPost (là repost), thì isSaved/isReposted của repost wrapper không được dùng
  isReposted: initialIsReposted = false,
  isSaved: initialIsSaved = false,
  // Thông tin repost (nếu là repost)
  isRepost = false,
  repostId = null,
  repostedBy = null,
  repostContent = null,
  // Thông tin bài gốc (nếu là repost)
  // Nếu có originalPost, nghĩa là đây là repost và isRepost sẽ tự động = true
  originalPost = null,
  // Privacy settings (chỉ cho post thường, không phải repost)
  whoCanSee = "everyone",
  whoCanComment = "everyone",
}) {
  // Tự động detect isRepost nếu có originalPost
  const isRepostMode = isRepost || !!originalPost;
  
  // Destructure originalPost nếu có
  const {
    likes: originalLikes = 0,
    commentsCount: originalCommentsCount = 0,
    repostsCount: originalRepostsCount = 0,
    savesCount: originalSavesCount = 0,
    isLiked: initialOriginalIsLiked = false,
    isSaved: initialOriginalIsSaved = false,
    isReposted: initialOriginalIsReposted = false,
    createdAt: originalCreatedAt = null,
    isDeleted: isOriginalPostDeleted = false,
  } = originalPost || {};
  // Gộp tất cả modal states thành một object
  const [modals, setModals] = useState({
    likes: false,
    comments: false,
    originalLikes: false,
    originalComments: false,
    originalRepost: false,
    settings: false,
  });

  // Helper functions để mở/đóng modal
  const openModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: false }));
  
  const [newRepostContent, setNewRepostContent] = useState("");
  const [commentText, setCommentText] = useState("");
  const [originalCommentText, setOriginalCommentText] = useState("");
  const [localIsLiked, setLocalIsLiked] = useState(initialIsLiked);
  const [localLikesCount, setLocalLikesCount] = useState(initialLikes);
  const [localIsReposted, setLocalIsReposted] = useState(initialIsReposted);
  const [localIsSaved, setLocalIsSaved] = useState(initialIsSaved);
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
  const targetId = isRepostMode && repostId ? repostId : id;
  const targetType = isRepostMode ? "REPOST" : "POST";
  const commentTargetId = isRepostMode && repostId ? repostId : id;
  const isRepostComment = isRepostMode && repostId;

  // Track post/repost view khi scroll qua
  // Nếu là repost, track với repostId; nếu là post, track với id
  const postViewRef = usePostView(isRepostMode ? null : id, isRepostMode ? repostId : null, true, 0.3, 1000); // Track khi 30% visible, delay 1s

  const { data: reactionsData, isLoading: loadingReactions } = useGetReactionsQuery(
    { targetId, targetType },
    { skip: !modals.likes || !targetId }
  );

  const [createOrUpdateReaction, { isLoading: isReacting }] = useCreateOrUpdateReactionMutation();
  const [savePost, { isLoading: isSaving }] = useSavePostMutation();
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();
  const [repostPost, { isLoading: isReposting }] = useRepostPostMutation();
  const [updatePost, { isLoading: isUpdatingPrivacy }] = useUpdatePostMutation();
  const [undoRepost, { isLoading: isUndoingRepost }] = useUndoRepostMutation();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
  
  const { data: commentsData, isLoading: loadingComments, refetch: refetchComments } = useGetCommentsByPostQuery(
    { postId: isRepostComment ? null : commentTargetId, repostId: isRepostComment ? commentTargetId : null, page: 1, limit: 50, sortBy: "desc" },
    { skip: !modals.comments || !commentTargetId }
  );
  
  // Comments cho bài gốc trong repost
  const { data: originalCommentsData, isLoading: loadingOriginalComments, refetch: refetchOriginalComments } = useGetCommentsByPostQuery(
    { postId: isRepostMode ? id : null, repostId: null, page: 1, limit: 50, sortBy: "desc" },
    { skip: !modals.originalComments || !isRepostMode || !id }
  );
  
  // Reactions cho bài gốc trong repost
  const { data: originalReactionsData, isLoading: loadingOriginalReactions } = useGetReactionsQuery(
    { targetId: id, targetType: "POST" },
    { skip: !modals.originalLikes || !isRepostMode || !id }
  );
  
  const comments = commentsData?.comments || [];
  const originalComments = originalCommentsData?.comments || [];
  const originalReactions = originalReactionsData?.reactions || [];
  const reactions = reactionsData?.reactions || [];
  
  // Sync local state với props khi props thay đổi
  useEffect(() => {
    setLocalIsLiked(initialIsLiked);
    setLocalLikesCount(initialLikes);
    setLocalIsReposted(initialIsReposted);
    setLocalIsSaved(initialIsSaved);
    setLocalCommentsCount(commentsCount);
    
    // Sync state cho bài gốc
    if (isRepostMode) {
      setOriginalIsLiked(initialOriginalIsLiked);
      setOriginalLikesCount(originalLikes);
      setOriginalIsSaved(initialOriginalIsSaved);
      setOriginalIsReposted(initialOriginalIsReposted);
      setOriginalCommentsCountLocal(originalCommentsCount);
    }
  }, [initialIsLiked, initialLikes, initialIsReposted, initialIsSaved, commentsCount, isRepostMode, initialOriginalIsLiked, originalLikes, initialOriginalIsSaved, initialOriginalIsReposted, originalCommentsCount]);

  const isLiked = localIsLiked;
  const isReposted = localIsReposted;
  const isSavingPost = isSaving || isUnsaving;
  const isRepostingPost = isReposting || isUndoingRepost;

  // Handler chung cho submit comment
  const handleSubmitComment = async (e, isOriginal = false) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    // Lấy text và validation tương ứng
    const currentCommentText = isOriginal ? originalCommentText : commentText;
    const setCurrentCommentText = isOriginal ? setOriginalCommentText : setCommentText;
    
    // Validation
    if (!currentCommentText.trim() || isCommenting) return;
    if (isOriginal && !id) return;
    if (!isOriginal && (!id && !repostId)) return;

    const content = currentCommentText.trim();
    setCurrentCommentText("");

    // Xác định postId và repostId
    const currentPostId = isOriginal ? id : (isRepostComment ? null : commentTargetId);
    const currentRepostId = isOriginal ? null : (isRepostComment ? commentTargetId : null);

    try {
      await createComment({
        postId: currentPostId,
        repostId: currentRepostId,
        content,
      }).unwrap();

      toast.success("Đã thêm bình luận");
      
      // Update count và refetch tương ứng
      if (isOriginal) {
        setOriginalCommentsCountLocal(prev => prev + 1);
        refetchOriginalComments();
      } else {
        setLocalCommentsCount(prev => prev + 1);
        refetchComments();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Thêm bình luận thất bại");
      setCurrentCommentText(content);
    }
  };

  const handleToggleLike = async (e, isOriginal = false) => {
    e?.stopPropagation();
    
    // Xác định targetId và targetType dựa trên isOriginal
    const currentTargetId = isOriginal ? id : targetId;
    const currentTargetType = isOriginal ? "POST" : targetType;
    
    if (!currentTargetId || isReacting) return;

    // Lấy state tương ứng
    const currentIsLiked = isOriginal ? originalIsLiked : isLiked;
    const currentLikeCount = isOriginal ? originalLikesCount : localLikesCount;
    const setCurrentIsLiked = isOriginal ? setOriginalIsLiked : setLocalIsLiked;
    const setCurrentLikeCount = isOriginal ? setOriginalLikesCount : setLocalLikesCount;

    // Nếu đang unlike, cần xác nhận
    if (currentIsLiked) {
      const confirm = await confirmToast("Bạn có chắc chắn muốn bỏ thích bài viết này?");
      if (!confirm) return;
    }

    // Optimistic update
    const wasLiked = currentIsLiked;
    const oldLikeCount = currentLikeCount;
    const newLikeCount = wasLiked ? oldLikeCount - 1 : oldLikeCount + 1;
    setCurrentIsLiked(!wasLiked);
    setCurrentLikeCount(newLikeCount);

    try {
      await createOrUpdateReaction({
        targetId: currentTargetId,
        targetType: currentTargetType,
        type: "LIKE",
      }).unwrap();
    } catch (error) {
      // Revert optimistic update nếu có lỗi
      setCurrentIsLiked(wasLiked);
      setCurrentLikeCount(oldLikeCount);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };
  
  // Handler cho toggle repost (chỉ repost bài gốc - id)
  const handleToggleRepost = async (e) => {
    e?.stopPropagation();
    if (!id || isRepostingPost) return;

    // Lấy trạng thái repost: nếu là repost thì dùng originalIsReposted, nếu là post thường thì dùng isReposted
    const currentIsReposted = isRepostMode ? originalIsReposted : isReposted;
    const setCurrentIsReposted = isRepostMode ? setOriginalIsReposted : setLocalIsReposted;

    // Nếu đã repost rồi thì hủy repost
    if (currentIsReposted) {
      const confirm = await confirmToast("Bạn có chắc chắn muốn hủy đăng lại bài viết này?");
      if (!confirm) return;

      const wasReposted = currentIsReposted;
      setCurrentIsReposted(false);

      try {
        await undoRepost(id).unwrap();
        toast.success("Đã hủy đăng lại");
        dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
      } catch (error) {
        setCurrentIsReposted(wasReposted);
        toast.error(error?.data?.message || "Có lỗi xảy ra");
      }
      return;
    }

    // Nếu chưa repost thì mở modal để nhập content
    openModal('originalRepost');
  };

  // Handler cho confirm repost (chỉ repost bài gốc - id)
  const handleConfirmRepost = async () => {
    if (!id || isRepostingPost) return;

    // Lấy trạng thái repost: nếu là repost thì dùng originalIsReposted, nếu là post thường thì dùng isReposted
    const currentIsReposted = isRepostMode ? originalIsReposted : isReposted;
    const setCurrentIsReposted = isRepostMode ? setOriginalIsReposted : setLocalIsReposted;

    const wasReposted = currentIsReposted;
    setCurrentIsReposted(true);

    try {
      await repostPost({ postId: id, content: newRepostContent.trim() }).unwrap();
      toast.success("Đã đăng lại bài viết");
      closeModal('originalRepost');
      setNewRepostContent("");
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: id }]));
    } catch (error) {
      setCurrentIsReposted(wasReposted);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handler chung cho toggle save (dùng cho cả post thường và bài gốc trong repost)
  const handleToggleSave = async (e, isOriginal = false) => {
    e?.stopPropagation();
    if (!id || isSavingPost) return;

    // Lấy state tương ứng
    const currentIsSaved = isOriginal ? originalIsSaved : localIsSaved;
    const setCurrentIsSaved = isOriginal ? setOriginalIsSaved : setLocalIsSaved;

    // Nếu đang unsave, cần xác nhận
    if (currentIsSaved) {
      const confirm = await confirmToast("Bạn có chắc chắn muốn bỏ lưu bài viết này?");
      if (!confirm) return;
    }

    const wasSaved = currentIsSaved;
    setCurrentIsSaved(!wasSaved);

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
      setCurrentIsSaved(wasSaved);
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };


  // Handler để cập nhật privacy settings
  const handleUpdatePrivacy = async (privacySettings) => {
    if (!id || isRepostMode) return; // Chỉ cho phép chỉnh sửa post thường, không phải repost

    try {
      await updatePost({
        postId: id,
        privacySettings,
      }).unwrap();
      
      // Cập nhật cache của feed trực tiếp thay vì invalidate để tránh mất dữ liệu
      dispatch(
        postApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 20 }, (draft) => {
          if (draft?.posts) {
            const postIndex = draft.posts.findIndex(p => p.id === id);
            if (postIndex !== -1) {
              draft.posts[postIndex] = {
                ...draft.posts[postIndex],
                whoCanSee: privacySettings.whoCanSee || draft.posts[postIndex].whoCanSee,
                whoCanComment: privacySettings.whoCanComment || draft.posts[postIndex].whoCanComment,
              };
            }
          }
        })
      );
      
      toast.success("Đã cập nhật quyền riêng tư");
    } catch (error) {
      toast.error(error?.data?.message || "Cập nhật quyền riêng tư thất bại");
    }
  };

  // Handler chung cho xóa comment
  const handleDeleteComment = async (commentId, isOriginal = false) => {
    try {
      const confirm = await confirmToast("Bạn có chắc chắn muốn xóa bình luận này?");
      if (!confirm) return;

      // Xác định postId và repostId tương ứng
      const currentPostId = isOriginal ? id : (isRepostComment ? null : commentTargetId);
      const currentRepostId = isOriginal ? null : (isRepostComment ? commentTargetId : null);

      await deleteComment({
        commentId,
        postId: currentPostId,
        repostId: currentRepostId,
      }).unwrap();

      toast.success("Đã xóa bình luận");
      
      // Update count và refetch tương ứng
      if (isOriginal) {
        setOriginalCommentsCountLocal(prev => Math.max(0, prev - 1));
        refetchOriginalComments();
      } else {
        setLocalCommentsCount(prev => Math.max(0, prev - 1));
        refetchComments();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Xóa bình luận thất bại");
    }
  };


  return (
    <article ref={postViewRef} className="border-b border-gray-200 w-full max-w-[500px] mx-auto px-2 md:px-0">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-2">
        <PostHeader
          user={user}
          createdAt={createdAt}
          content={!isRepostMode ? content : repostContent}
          isRepost={isRepostMode}
          repostedBy={repostedBy}
          onNavigate={navigate}
          size="normal"
        />
        {/* Menu chỉnh sửa - chỉ hiển thị cho post của chính user và không phải repost */}
        {/* Lưu ý: user.id là id từ user object trong post, cần kiểm tra với currentUser */}
        {currentUser?.id && user.id && currentUser.id === user.id && !isRepostMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('settings');
            }}
            className="text-gray-600 hover:text-gray-800 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Repost Layout */}
      {isRepostMode && repostedBy ? (
        <OriginalPostContent
          user={isOriginalPostDeleted ? null : user}
          content={isOriginalPostDeleted ? null : content}
          media={isOriginalPostDeleted ? [] : media}
          createdAt={isOriginalPostDeleted ? null : (originalCreatedAt || createdAt)}
          likesCount={originalLikesCount}
          commentsCount={originalCommentsCountLocal}
          savesCount={originalSavesCount}
          repostsCount={originalRepostsCount}
          isLiked={originalIsLiked}
          isSaved={originalIsSaved}
          isReposted={originalIsReposted}
          isReacting={isReacting}
          isSaving={isSavingPost}
          isReposting={isRepostingPost}
          onToggleLike={(e) => handleToggleLike(e, true)}
          onToggleSave={(e) => handleToggleSave(e, true)}
          onToggleRepost={handleToggleRepost}
          onOpenComments={(e) => {
            e?.stopPropagation();
            openModal('originalComments');
          }}
          onOpenLikes={() => openModal('originalLikes')}
          navigate={navigate}
          isDeleted={isOriginalPostDeleted}
        />
      ) : (
        <>
          {/* Post Image / Carousel */}
          {media.length > 0 && (
            <div className="mb-3 mx-auto w-full aspect-square rounded-md overflow-hidden relative">
              <PostMediaViewer
                media={media}
                content={content}
                className="!flex-none w-full h-full rounded-md"
              />
            </div>
          )}
        </>
      )}

      {/* Post Actions - Cho post thường hoặc repost wrapper */}
      {/* Lưu ý: Repost wrapper không có nút save và repost (chỉ có like và comment) */}
      <div className="mb-2">
        <PostActions
          isLiked={isLiked}
          isReposted={isReposted}
          isSaved={!isRepostMode ? localIsSaved : false}
          isReacting={isReacting}
          isReposting={isRepostingPost}
          isSaving={isSavingPost}
          onToggleLike={handleToggleLike}
          onOpenComments={(e) => {
            e?.stopPropagation();
            openModal('comments');
          }}
          onToggleRepost={!isRepostMode ? handleToggleRepost : undefined}
          onToggleSave={!isRepostMode ? handleToggleSave : undefined}
          showRepost={!isRepostMode}
          showSave={!isRepostMode}
          size={22}
        />
      </div>

      {/* Likes */}
      {localLikesCount > 0 && (
        <div className="mb-1">
          <button
            onClick={() => openModal('likes')}
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
            openModal('comments');
          }}
          className="text-gray-500 text-sm mb-1 hover:underline cursor-pointer"
        >
          Xem tất cả {localCommentsCount} bình luận
        </button>
      ) : (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            openModal('comments');
          }}
          className="text-gray-500 text-sm mb-1 hover:underline cursor-pointer"
        >
          Thêm bình luận đầu tiên
        </button>
      )}

      {/* Reposts Count */}
      {!isRepostMode && repostsCount > 0 && (
        <div className="mb-1">
          <span className="text-gray-500 text-sm">
            {repostsCount.toLocaleString()} lượt đăng lại
          </span>
        </div>
      )}

      {/* Modal danh sách người thích */}
      <LikesModal
        isOpen={modals.likes}
        onClose={() => closeModal('likes')}
        reactions={reactions}
        isLoading={loadingReactions}
        currentUserId={currentUser?.id}
      />

      {/* Repost Modal - chỉ hiển thị khi không phải repost (post thường) */}
      {!isRepostMode && (
        <RepostModal
          isOpen={modals.originalRepost}
          onClose={() => {
            closeModal('originalRepost');
            setNewRepostContent("");
          }}
          content={newRepostContent}
          onContentChange={setNewRepostContent}
          onConfirm={handleConfirmRepost}
          isLoading={isRepostingPost}
        />
      )}

      {/* Comments Modal */}
      <CommentsModal
        isOpen={modals.comments}
        onClose={() => {
          closeModal('comments');
          setCommentText("");
        }}
        comments={comments}
        isLoading={loadingComments}
        commentText={commentText}
        onCommentTextChange={(value) => setCommentText(value)}
        onSubmitComment={handleSubmitComment}
        onDeleteComment={handleDeleteComment}
        isCommenting={isCommenting}
        isDeletingComment={isDeletingComment}
        postId={isRepostComment ? null : commentTargetId}
        repostId={isRepostComment ? commentTargetId : null}
      />

      {/* Original Post Likes Modal */}
      {isRepost && (
        <LikesModal
          isOpen={modals.originalLikes}
          onClose={() => closeModal('originalLikes')}
          reactions={originalReactions}
          isLoading={loadingOriginalReactions}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Original Post Comments Modal */}
      {isRepost && (
        <CommentsModal
          isOpen={modals.originalComments}
          onClose={() => {
            closeModal('originalComments');
            setOriginalCommentText("");
          }}
          comments={originalComments}
          isLoading={loadingOriginalComments}
          commentText={originalCommentText}
          onCommentTextChange={(value) => setOriginalCommentText(value)}
          onSubmitComment={(e) => handleSubmitComment(e, true)}
          onDeleteComment={(commentId) => handleDeleteComment(commentId, true)}
          isCommenting={isCommenting}
          isDeletingComment={isDeletingComment}
          postId={id}
          repostId={null}
        />
      )}

      {/* Original Post Repost Modal */}
      {isRepost && (
        <RepostModal
          isOpen={modals.originalRepost}
          onClose={() => {
            closeModal('originalRepost');
            setNewRepostContent("");
          }}
          content={newRepostContent}
          onContentChange={setNewRepostContent}
          onConfirm={handleConfirmRepost}
          isLoading={isRepostingPost}
        />
      )}

      {/* Post Settings Menu - chỉ hiển thị cho post thường của chính user */}
      {!isRepostMode && (
        <PostSettingsMenu
          isOpen={modals.settings}
          onClose={() => closeModal('settings')}
          whoCanSee={whoCanSee}
          whoCanComment={whoCanComment}
          onUpdatePrivacy={handleUpdatePrivacy}
          isUpdating={isUpdatingPrivacy}
        />
      )}
    </article>
  );
}

export default Post;
