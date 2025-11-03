import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUser } from "../../features/auth/authSlice";
import {
  useGetFollowStatsQuery,
  useGetPublicProfileQuery,
  useGetFollowStatusQuery,
  useGetFollowersQuery,
  useGetFollowingsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCancelFollowRequestMutation,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useUploadAvatarMutation,
  useGetUserPostsQuery,
} from "../../features/profile/profileApi";
import { useUpdatePostMutation, useGetPostByIdQuery, postApi } from "../../features/post/postApi";
import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} from "../../features/comment/commentApi";
import {
  useCreateOrUpdateReactionMutation,
  useGetMyReactionQuery,
} from "../../features/reaction/reactionApi";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Grid,
  Play,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  X,
  Settings,
  Camera,
  CheckCircle,
  Send,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import confirmToast from "../../components/common/confirmToast";
import Footer from "../../components/layouts/Footer";
import FollowButton from "../../components/common/FollowButton";
import ModalUserItem from "../../features/profile/ModalUserItem";
import ModalSkeleton from "../../components/common/ModalSkeleton";
import ProfileSkeleton from "../../components/common/ProfileSkeleton";
export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    whoCanSee: "public",
    whoCanComment: "everyone",
  });
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [createComment, { isLoading: isCommenting }] =
    useCreateCommentMutation();
  const [commentText, setCommentText] = useState("");
  const settingsMenuRef = useRef(null);
  const privacySettingsRef = useRef(null);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { username: routeUsername } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewingUsername = routeUsername || currentUser?.username;

  const isSelf =
    viewingUsername &&
    currentUser?.username &&
    viewingUsername === currentUser.username;

  const { data: publicProfileData, isLoading: loadingPublicProfile } =
    useGetPublicProfileQuery(viewingUsername, {
      skip: !viewingUsername || isSelf,
    });
  const profileUser = isSelf
    ? currentUser
    : publicProfileData?.user || currentUser;

  const { data: statsData, isLoading: loadingStats } = useGetFollowStatsQuery(
    viewingUsername,
    {
      skip: !viewingUsername,
    }
  );
  const followerCount = statsData?.stats?.followerCount ?? 0;
  const followingCount = statsData?.stats?.followingCount ?? 0;
  const postCount = statsData?.stats?.postCount ?? 0;

  // Lấy danh sách người theo dõi và đang theo dõi khi modal được mở
  const {
    data: followersData,
    isLoading: loadingFollowers,
    error: followersError,
  } = useGetFollowersQuery(viewingUsername, {
    skip: !showModal || modalType !== "followers" || !viewingUsername,
  });

  const {
    data: followingsData,
    isLoading: loadingFollowings,
    error: followingsError,
  } = useGetFollowingsQuery(viewingUsername, {
    skip: !showModal || modalType !== "following" || !viewingUsername,
  });

  const { data: followStatus, isFetching: loadingStatus } =
    useGetFollowStatusQuery(viewingUsername, { skip: !viewingUsername });
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const [cancelFollowRequest, { isLoading: unrequesting }] =
    useCancelFollowRequestMutation();
  const [acceptFollowRequest, { isLoading: accepting }] =
    useAcceptFollowRequestMutation();
  const [rejectFollowRequest, { isLoading: rejecting }] =
    useRejectFollowRequestMutation();
  const [uploadAvatar] = useUploadAvatarMutation();

  const isPrivate = profileUser?.privacySettings?.isPrivate;

  const { data: postsData, isLoading: loadingPosts } = useGetUserPostsQuery(
    { username: viewingUsername },
    {
      skip:
        !viewingUsername ||
        (profileUser && !isSelf && isPrivate && !followStatus?.isFollowing),
    }
  );

  const posts = postsData?.posts || [];

  // Mở post modal khi có postId trong URL
  useEffect(() => {
    const postIdFromUrl = searchParams.get('postId');
    if (!postIdFromUrl || selectedPost) return; // Đã có post được chọn rồi thì không làm gì

    const postId = Number(postIdFromUrl);
    
    // Tìm post trong danh sách posts hiện tại
    const foundPost = posts.find(p => p.id === postId);
    if (foundPost) {
      setSelectedPost(foundPost);
    } else {
      // Nếu không tìm thấy, set postId để fetch từ API
      setSelectedPost({ id: postId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedPost, posts]);

  const { data: fullPostData } = useGetPostByIdQuery(selectedPost?.id || 0, {
    skip: !selectedPost?.id || (selectedPost?.media && selectedPost?.user),
  });

  const selectedPostFull = selectedPost ? (fullPostData?.post || selectedPost) : null;

  const isPostOwner = selectedPostFull && currentUser?.id === selectedPostFull.userId;

  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch: refetchComments,
  } = useGetCommentsByPostQuery(
    { postId: selectedPostFull?.id || 0, page: 1, limit: 10, sortBy: "desc" },
    { skip: !selectedPostFull?.id }
  );

  const comments = commentsData?.comments || [];

  const {
    data: myReactionData,
    isLoading: loadingMyReaction,
    refetch: refetchMyReaction,
  } = useGetMyReactionQuery(
    {
      targetId: selectedPostFull?.id || 0,
      targetType: "POST",
    },
    { skip: !selectedPostFull?.id }
  );

  const myReaction = myReactionData;
  const isLiked = !!myReaction;

  const [createOrUpdateReaction, { isLoading: isReacting }] =
    useCreateOrUpdateReactionMutation();

  useEffect(() => {
    if (selectedPostFull) {
      const whoCanSee = selectedPostFull.whoCanSee || "public";
      const whoCanComment = selectedPostFull.whoCanComment || "everyone";
      setPrivacySettings({
        whoCanSee,
        whoCanComment,
      });
      setShowSettingsMenu(false);
      setShowPrivacySettings(false);
    }
  }, [selectedPostFull]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideSettingsMenu = settingsMenuRef.current?.contains(
        event.target
      );
      const isClickInsidePrivacySettings = privacySettingsRef.current?.contains(
        event.target
      );

      if (!isClickInsideSettingsMenu && !isClickInsidePrivacySettings) {
        setShowSettingsMenu(false);
        setShowPrivacySettings(false);
      }
    };

    if (showSettingsMenu || showPrivacySettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsMenu, showPrivacySettings]);

  const handleUpdatePrivacy = async () => {
    if (!selectedPostFull || !isPostOwner) return;

    try {
      await updatePost({
        postId: selectedPostFull.id,
        privacySettings,
      }).unwrap();

      toast.success("Đã cập nhật cài đặt quyền riêng tư");
      setShowPrivacySettings(false);
      setShowSettingsMenu(false);
    } catch (error) {
      toast.error(error?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleClosePostModal = () => {
    const postId = selectedPost?.id;
    
    // Đóng modal và reset states
    setSelectedPost(null);
    setShowSettingsMenu(false);
    setShowPrivacySettings(false);
    setCommentText("");
    
    // Xóa postId khỏi URL để tránh modal tự mở lại
    if (searchParams.get('postId')) {
      searchParams.delete('postId');
      setSearchParams(searchParams, { replace: true });
    }
    
    // Invalidate cache nếu có
    if (postId) {
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: postId }]));
    }
  };

  const handleOpenPrivacySettings = () => {
    setShowPrivacySettings(true);
    setShowSettingsMenu(false);
  };

  const handleSubmitComment = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!commentText.trim() || !selectedPostFull || isCommenting) return;

    const content = commentText.trim();
    setCommentText("");

    try {
      await createComment({
        postId: selectedPostFull.id,
        content,
      }).unwrap();

      toast.success("Đã thêm bình luận");
      refetchComments();
    } catch (error) {
      toast.error(error?.data?.message || "Thêm bình luận thất bại");
      setCommentText(content);
    }
  };

  const handleToggleLike = async (e) => {
    e?.stopPropagation();
    if (!selectedPostFull) return;

    try {
      await createOrUpdateReaction({
        targetId: selectedPostFull.id,
        targetType: "POST",
        type: "LIKE",
      }).unwrap();

      refetchMyReaction();
    } catch (error) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const isLoadingProfileData =
    (!isSelf && loadingPublicProfile) || loadingStats || loadingStatus;

  if (isLoadingProfileData) {
    return <ProfileSkeleton />;
  }

  // Mở modal danh sách người theo dõi hoặc đang theo dõi
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file).unwrap();
      if (result?.success && result?.user) {
        dispatch(updateUser(result.user));
        toast.success("Đã cập nhật ảnh đại diện");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Có lỗi xảy ra khi upload ảnh");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const onFollowToggle = async () => {
    if (!viewingUsername || followStatus?.isSelf) return;

    try {
      if (followStatus?.isFollowing) {
        const confirm = await confirmToast(
          "Bạn có chắc muốn hủy theo dõi người này?"
        );
        if (!confirm) return;
        await unfollowUser(viewingUsername).unwrap();
        toast.info("Đã hủy theo dõi");
      } else if (followStatus?.isPending) {
        const confirm = await confirmToast("Hủy yêu cầu theo dõi ?");
        if (!confirm) return;
        await cancelFollowRequest(viewingUsername).unwrap();
        toast.info("Đã hủy yêu cầu theo dõi");
      } else {
        const result = await followUser(viewingUsername).unwrap();
        toast.success(result.message || "Đã theo dõi người dùng");
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className=" ml-[var(--feed-sidebar-width)] flex flex-1  justify-center">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-12 mb-12">
          {/* Avatar */}
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0 group">
            <img
              src={profileUser?.avatarUrl}
              alt={profileUser?.username}
              className="w-full h-full object-cover"
            />
            {isSelf && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${
                    isUploadingAvatar ? "opacity-100 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploadingAvatar ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={32} className="text-white" />
                  )}
                </label>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-light">
                {profileUser?.username || "user"}
              </h2>
              <FollowButton
                followStatus={followStatus}
                viewingUsername={viewingUsername}
                following={following}
                unfollowing={unfollowing}
                unrequesting={unrequesting}
                loadingStatus={loadingStatus}
                onFollowToggle={onFollowToggle}
                acceptFollowRequest={acceptFollowRequest}
                rejectFollowRequest={rejectFollowRequest}
                accepting={accepting}
                rejecting={rejecting}
                isChatButtonVisible={true}
              >
                {/* Custom actions cho trường hợp isSelf - bạn có thể tùy chỉnh ở đây */}
                <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition">
                  Chỉnh sửa trang cá nhân
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Settings size={20} />
                </button>
              </FollowButton>
            </div>
            {/* Thống kê */}
            <div className="flex gap-10 mb-6 text-base">
              <span>
                <strong>{postCount}</strong>{" "}
                <span className="text-gray-400">bài viết</span>
              </span>
              <span
                onClick={() => openModal("followers")}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <strong>{followerCount}</strong>{" "}
                <span className="text-gray-400">người theo dõi</span>
              </span>
              <span
                onClick={() => openModal("following")}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-gray-400">Đang theo dõi</span>{" "}
                <strong>{followingCount}</strong>{" "}
                <span className="text-gray-400">người dùng</span>
              </span>
            </div>
            {/* Tiểu sử */}
            <div>
              <p className="font-semibold text-base ">
                {profileUser?.fullName}
              </p>
            </div>
          </div>
        </div>

        {!isSelf && isPrivate && !followStatus?.isFollowing ? (
          <div className="border-t border-gray-200 my-6 pt-8 flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-3 p-16">
              <div className="flex items-center justify-center w-20 h-20 rounded-full border border-gray-300">
                <Lock className="w-10 h-10 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Đây là tài khoản riêng tư
                </p>
                <p className="text-gray-500 text-sm">
                  Hãy theo dõi để xem ảnh và video của họ.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex justify-center gap-12 mb-8 border-t border-gray-300 pt-4">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "posts"
                    ? "text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Grid size={20} /> Posts
              </button>
              <button
                onClick={() => setActiveTab("reels")}
                className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "reels"
                    ? "text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Play size={20} /> Reels
              </button>
              <button
                onClick={() => setActiveTab("tagged")}
                className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "tagged"
                    ? "text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Tag size={20} /> Tagged
              </button>
            </div>

            {/* Posts Grid */}
            <div className="min-h-[600px]">
              {activeTab === "posts" && (
                <>
                  {loadingPosts ? (
                    <div className="grid grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-4 gap-1 animate-fadeIn">
                      {posts.map((post) => {
                        const previewImage = post.previewImage;
                        const likeCount = post.reactionCount || 0;
                        const commentCount = post.commentCount || 0;

                        return (
                          <div
                            key={post.id}
                            className="relative group cursor-pointer aspect-square overflow-hidden bg-gray-100"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowSettingsMenu(false);
                              setShowPrivacySettings(false);
                            }}
                          >
                            {previewImage ? (
                              <img
                                src={previewImage}
                                alt="Post"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                onError={(e) => {
                                  e.target.src = "/images/placeholder.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                <MessageCircle size={32} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition duration-300 text-white flex gap-6 text-xl">
                                <div className="flex items-center gap-1">
                                  <Heart size={20} fill="currentColor" />
                                  <span className="text-sm">{likeCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle size={20} />
                                  <span className="text-sm">
                                    {commentCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Grid size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        Chưa có bài viết nào
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "reels" && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Play size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chưa có reel nào</p>
                </div>
              )}

              {activeTab === "tagged" && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Tag size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Chưa có bài viết được gắn thẻ
                  </p>
                </div>
              )}
            </div>

            {/* Modal for Post */}
            {selectedPost && selectedPostFull && (
              <div
                className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
                onClick={handleClosePostModal}
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
                  <div className="w-96 p-4 border-l border-gray-300 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-300">
                      <img
                        src={
                          selectedPostFull.user?.avatarUrl ||
                          "/images/avatar-IG-mac-dinh-1.jpg"
                        }
                        alt={selectedPostFull.user?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-semibold flex-1">
                        {selectedPostFull.user?.username}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClosePostModal();
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
                              setShowSettingsMenu(!showSettingsMenu);
                              setShowPrivacySettings(false);
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          >
                            •••
                          </button>
                          {showSettingsMenu && (
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
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto mb-6 pb-6 border-b border-gray-300">
                      <div className="flex gap-3 mb-3">
                        <img
                          src={
                            selectedPostFull.user?.avatarUrl ||
                            "/images/avatar-IG-mac-dinh-1.jpg"
                          }
                          alt={selectedPostFull.user?.username}
                          className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                        />
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">
                              {selectedPostFull.user?.username}
                            </span>{" "}
                            {selectedPostFull.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              selectedPostFull.createdAt
                            ).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      {/* ------All commnents------ */}
                      <div className="flex-1 overflow-y-auto mb-3 max-h-[250px] min-h-[100px]">
                        {loadingComments ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Đang tải bình luận...
                          </div>
                        ) : comments.length > 0 ? (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <img
                                  src={
                                    comment.user?.avatarUrl ||
                                    "/images/avatar-IG-mac-dinh-1.jpg"
                                  }
                                  alt={comment.user?.username}
                                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                                />
                                <div className="flex-1">
                                  <div className="">
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
                                </div>
                              </div>
                            ))}
                            {commentsData?.pagination?.hasNextPage && (
                              <button
                                onClick={() => {
                                  // TODO: Load more comments
                                }}
                                className="text-blue-500 text-sm font-medium hover:text-blue-600 transition"
                              >
                                Xem thêm bình luận
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Chưa có bình luận nào
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 mb-3 text-gray-700">
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

                    <div className="text-sm text-gray-700 flex justify-between">
                      <p className="font-semibold text-gray-900 mb-1">
                        {selectedPostFull._count?.reactions || 0} lượt thích
                      </p>
                      <p className="text-gray-600 mb-3">
                        {selectedPostFull._count?.comments || 0} bình luận
                      </p>
                    </div>

                    <div className="pt-3">
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

                    {showPrivacySettings && isPostOwner && (
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
                                <option value="public">Công khai - Mọi người có thể xem</option>
                                <option value="follower">Người theo dõi - Chỉ người theo dõi bạn</option>
                                <option value="private">Riêng tư - Chỉ bạn mới thấy</option>
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
                                <option value="follower">Người theo dõi - Chỉ người theo dõi bạn</option>
                                <option value="no_one">Tắt - Không ai có thể bình luận</option>
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
                                setShowPrivacySettings(false);
                                setPrivacySettings({
                                  whoCanSee: selectedPostFull.whoCanSee || "public",
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
            )}
          </>
        )}

        <Footer />
      </div>

      {/* Modal hiển thị danh sách người theo dõi hoặc đang theo dõi */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg min-h-[400px] max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center  pt-2 px-2">
              <div className="w-6"></div>
              <h3 className="text-base font-semibold">
                {modalType === "followers" ? "Người theo dõi" : "Đang theo dõi"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-200 border-0 text-sm"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {modalType === "followers" ? (
                loadingFollowers ? (
                  <ModalSkeleton />
                ) : followersError?.status === 403 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Tài khoản này là riêng tư
                    </p>
                    <p className="text-sm text-gray-500">
                      Bạn cần theo dõi để xem danh sách người theo dõi
                    </p>
                  </div>
                ) : followersData?.followers?.length > 0 ? (
                  <div>
                    {followersData.followers.map((user) => {
                      return (
                        <ModalUserItem
                          key={user.id}
                          user={user}
                          currentUserId={currentUser?.id}
                          onClose={closeModal}
                          isFollower={true}
                          isSelfProfile={isSelf}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Không có người theo dõi nào
                  </div>
                )
              ) : modalType === "following" ? (
                loadingFollowings ? (
                  <ModalSkeleton />
                ) : followingsError?.status === 403 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Tài khoản này là riêng tư
                    </p>
                    <p className="text-sm text-gray-500">
                      Bạn cần theo dõi để xem danh sách đang theo dõi
                    </p>
                  </div>
                ) : followingsData?.followings?.length > 0 ? (
                  <div>
                    {followingsData.followings.map((user) => {
                      return (
                        <ModalUserItem
                          key={user.id}
                          user={user}
                          currentUserId={currentUser?.id}
                          onClose={closeModal}
                          isFollower={false}
                          isSelfProfile={isSelf}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Không đang theo dõi ai
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
