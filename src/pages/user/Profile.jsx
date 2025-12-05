import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { Grid, BookmarkCheck, Lock, Settings, Camera, X, Repeat2, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { selectCurrentUser, updateUser } from "../../features/auth/authSlice";
import {
  useGetFollowStatsQuery,
  useGetPublicProfileQuery,
  useGetFollowStatusQuery,
  useGetFollowersQuery,
  useGetFollowingsQuery,
  useUploadAvatarMutation,
  useGetUserPostsQuery,
  useUpdatePrivacySettingsMutation,
} from "../../features/profile/api/profileApi";
import { postApi, useGetSavedPostsQuery } from "../../features/post/api/postApi";
import { useGetUserRepostsQuery } from "../../features/repost/api/repostApi";

import FollowButton from "../../components/common/FollowButton";
import ModalUserItem from "../../features/profile/components/ModalUserItem";
import { ProfileSkeleton } from "../../components/common/skeletons";
import PostGridItem from "../../features/post/components/PostGridItem";
import Post from "../../features/post/components/Post";
import PostDetailModal from "../../features/post/components/PostDetailModal";
import Footer from "../../components/layouts/Footer";
import { ModalSkeleton } from "../../components/common/skeletons";
export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showUserPrivacyModal, setShowUserPrivacyModal] = useState(false);
  const [userPrivacySettings, setUserPrivacySettings] = useState({
    isPrivate: false,
    whoCanMessage: "everyone",
    whoCanTagMe: "everyone",
    whoCanFindByUsername: "everyone",
    showOnlineStatus: true,
  });
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
    { skip: !viewingUsername }
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

  const { data: followStatus } =
    useGetFollowStatusQuery(viewingUsername, { skip: !viewingUsername });
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updatePrivacySettings, { isLoading: isUpdatingPrivacy }] = useUpdatePrivacySettingsMutation();

  const isPrivate = profileUser?.privacySettings?.isPrivate;

  const normalizePrivacyEnum = (value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['everyone', 'followers', 'nobody'].includes(normalized)) {
        return normalized;
      }
    }
    return 'everyone'; 
  };

  // Load user privacy settings khi component mount
  useEffect(() => {
    if (currentUser?.privacySettings) {
      setUserPrivacySettings({
        isPrivate: Boolean(currentUser.privacySettings.isPrivate ?? false),
        whoCanMessage: normalizePrivacyEnum(currentUser.privacySettings.whoCanMessage),
        whoCanTagMe: normalizePrivacyEnum(currentUser.privacySettings.whoCanTagMe),
        whoCanFindByUsername: normalizePrivacyEnum(currentUser.privacySettings.whoCanFindByUsername),
        showOnlineStatus: Boolean(currentUser.privacySettings.showOnlineStatus ?? true),
      });
    }
  }, [currentUser]);

  const { data: postsData, isLoading: loadingPosts } = useGetUserPostsQuery(
    { username: viewingUsername },
    { 
      skip:
        !viewingUsername ||
        (profileUser && !isSelf && isPrivate && !followStatus?.isFollowing),
    }
  );
  
  const posts = useMemo(() => postsData?.posts || [], [postsData?.posts]);

  // Lấy saved posts (chỉ khi là profile của chính mình)
  const { data: savedPostsData, isLoading: loadingSavedPosts } = useGetSavedPostsQuery(
    { username: viewingUsername, page: 1, limit: 100 },
    { skip: !isSelf || activeTab !== "saved" || !viewingUsername }
  );

  const savedPosts = useMemo(() => {
    if (!savedPostsData?.items) return [];
    return savedPostsData.items.map(item => ({
      ...item.post,
      previewImage: item.post.previewImage || item.post.media?.[0]?.mediaUrl || null,
      reactionCount: item.post._count?.reactions || 0,
      commentCount: item.post._count?.comments || 0,
    }));
  }, [savedPostsData?.items]);

  const { data: repostsData, isLoading: loadingReposts } = useGetUserRepostsQuery(
    { username: viewingUsername },
    { 
      skip: 
        activeTab !== "reposts" || 
        !viewingUsername ||
        (profileUser && !isSelf && isPrivate && !followStatus?.isFollowing)
    }
  );

  const reposts = useMemo(() => {
    if (!repostsData?.reposts) return [];
    return repostsData.reposts.map(repost => {
      const isOriginalPostDeleted = repost.isOriginalPostDeleted || false;
      const originalPost = repost.post;
      
      return {
        // ID của post gốc (luôn cần để dùng cho originalPost actions)
        id: originalPost?.id || repost.postId,
        // Chỉ spread post data nếu post không bị xóa hoặc ẩn
        ...(isOriginalPostDeleted ? {} : (originalPost || {})),
        previewImage: isOriginalPostDeleted ? null : (originalPost?.media?.[0]?.mediaUrl || null),
        previewMediaType: isOriginalPostDeleted ? null : (originalPost?.media?.[0]?.mediaType || null),
        // Stats của repost (reaction và comment của chính repost)
        repostReactionCount: repost.reactionCount || 0,
        repostCommentCount: repost.commentCount || 0,
        // Trạng thái tương tác của chính repost (từ API)
        isLiked: repost.isLiked || false,
        isSaved: repost.isSaved || false,
        isReposted: repost.isReposted || false,
        // Stats của bài gốc (từ API, có fallback về _count nếu cần)
        originalReactionCount: isOriginalPostDeleted ? 0 : (originalPost?.originalReactionCount ?? originalPost?._count?.reactions ?? 0),
        originalCommentCount: isOriginalPostDeleted ? 0 : (originalPost?.originalCommentCount ?? originalPost?._count?.comments ?? 0),
        originalRepostsCount: isOriginalPostDeleted ? 0 : (originalPost?.originalRepostsCount ?? originalPost?._count?.reposts ?? 0),
        originalSavesCount: isOriginalPostDeleted ? 0 : (originalPost?.originalSavesCount ?? originalPost?._count?.savedPosts ?? 0),
        // Trạng thái tương tác của bài gốc (từ API)
        originalIsLiked: isOriginalPostDeleted ? false : (originalPost?.originalIsLiked ?? false),
        originalIsSaved: isOriginalPostDeleted ? false : (originalPost?.originalIsSaved ?? false),
        originalIsReposted: isOriginalPostDeleted ? false : (originalPost?.originalIsReposted ?? false),
        // Thời gian của bài gốc
        originalCreatedAt: isOriginalPostDeleted ? null : (originalPost?.originalCreatedAt ?? originalPost?.createdAt ?? null),
        // Thông tin repost
        isRepost: true,
        repostedBy: repost.user,
        repostContent: repost.content,
        repostCreatedAt: repost.createdAt,
        repostId: repost.id,
        // Đánh dấu post gốc bị xóa hoặc ẩn
        isOriginalPostDeleted,
        // User và media của post gốc (chỉ khi không bị xóa hoặc ẩn) - override các giá trị từ spread
        user: isOriginalPostDeleted ? null : originalPost?.user,
        media: isOriginalPostDeleted ? [] : (originalPost?.media || []),
        content: isOriginalPostDeleted ? null : (originalPost?.content || null),
      };
    });
  }, [repostsData?.reposts]);

  // Mở post modal khi có postId trong URL
  useEffect(() => {
    const postIdFromUrl = searchParams.get('postId');
    if (!postIdFromUrl || selectedPost) return;

    const postId = Number(postIdFromUrl);
    const foundPost = posts.find(p => p.id === postId);
    if (foundPost) {
      setSelectedPost(foundPost);
    } else {
      setSelectedPost({ id: postId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedPost, posts]);

  const handleClosePostModal = () => {
    const postId = selectedPost?.id;
    setSelectedPost(null);
    setShowSettingsMenu(false);
    setShowPrivacySettings(false);
    
    if (searchParams.get('postId')) {
      searchParams.delete('postId');
      setSearchParams(searchParams, { replace: true });
    }
    
    if (postId) {
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: postId }]));
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const isLoadingProfileData = (!isSelf && loadingPublicProfile) || loadingStats;
  
  if (isLoadingProfileData) {
    return <ProfileSkeleton />;
  }

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


  return (
    <div className="w-full min-w-0 md:ml-[var(--feed-sidebar-width)] flex flex-1 justify-center pb-20 md:pb-0 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-8 min-w-0">
        {/* Header */}
        <div className="flex gap-6 md:gap-12 mb-6 md:mb-12">
          {/* Avatar */}
          <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0 group">
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
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-3xl font-light">
                {profileUser?.username || "user"}
              </h2>
              <FollowButton
                followStatus={followStatus}
                viewingUsername={viewingUsername}
                isChatButtonVisible={true}
              >
                <button
                  onClick={() => {
                    setShowUserPrivacyModal(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Settings size={20} />
                </button>
              </FollowButton>
            </div>
            {/* Thống kê */}
            <div className="flex gap-6 md:gap-10 mb-4 md:mb-6 text-sm md:text-base">
              <span className="flex items-center gap-1.5">
                <Grid size={16} className="text-gray-600 md:hidden" />
                <strong>{postCount}</strong>
                <span className="hidden md:inline text-gray-400"> bài viết</span>
              </span>
              <span
                onClick={() => openModal("followers")}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <Users size={16} className="text-gray-600 md:hidden" />
                <strong>{followerCount}</strong>
                <span className="hidden md:inline text-gray-400"> người theo dõi</span>
              </span>
              <span
                onClick={() => openModal("following")}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <UserPlus size={16} className="text-gray-600 md:hidden" />
                <span className="hidden md:inline text-gray-400"> Đang theo dõi</span>

                <strong>{followingCount}</strong>
                <span className="hidden md:inline text-gray-400"> người dùng</span>
              </span>
            </div>
            {/* Tiểu sử */}
            <div>
              <p className="font-semibold text-sm md:text-base">
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
            <div className="flex justify-center gap-6 md:gap-12 mb-4 md:mb-8 border-t border-gray-300 pt-4">
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
                onClick={() => setActiveTab("reposts")}
                className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition ${
                  activeTab === "reposts"
                    ? "text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Repeat2 size={20} /> Đã đăng lại
              </button>
              {isSelf && (
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition ${
                    activeTab === "saved"
                      ? "text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <BookmarkCheck size={20} /> Đã lưu
                </button>
              )}
            </div>

            {/* Posts Grid */}
            <div className="min-h-[400px] md:min-h-[600px]">
              {activeTab === "posts" && (
                <>
                  {loadingPosts ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 animate-fadeIn">
                      {posts.map((post) => (
                        <PostGridItem
                      key={post.id}
                      post={post}
                      onClick={() => {
                        setSelectedPost(post);
                        setShowSettingsMenu(false);
                        setShowPrivacySettings(false);
                      }}
                    />
                      ))}
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

              {activeTab === "reposts" && (
                <>
                  {loadingReposts ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Đang tải bài viết đã đăng lại...</p>
                    </div>
                  ) : reposts.length > 0 ? (
                    <div className="space-y-6 animate-fadeIn mb-16">
                      {reposts.map((post) => (
                        <Post
                          key={`repost-${post.id}-${post.repostCreatedAt}`}
                          id={post.id}
                          user={{
                            username: post.user?.username || "unknown",
                            fullName: post.user?.fullName || "",
                            avatar: post.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg",
                            verified: false,
                          }}
                          media={post.media?.map(m => ({
                            mediaUrl: m.mediaUrl,
                            type: m.mediaType?.toLowerCase() || "image"
                          })) || []}
                          content={post.content || ""}
                          createdAt={post.repostCreatedAt || post.createdAt}
                          likes={post.repostReactionCount || 0}
                          commentsCount={post.repostCommentCount || 0}
                          isLiked={post.isLiked ?? false}
                          isReposted={post.isReposted ?? false}
                          isSaved={post.isSaved ?? false}
                          isRepost={true}
                          repostId={post.repostId || null}
                          repostedBy={post.repostedBy || null}
                          repostContent={post.repostContent || null}
                          originalPost={{
                            likes: post.originalReactionCount ?? 0,
                            commentsCount: post.originalCommentCount ?? 0,
                            repostsCount: post.originalRepostsCount ?? 0,
                            savesCount: post.originalSavesCount ?? 0,
                            isLiked: post.originalIsLiked ?? false,
                            isSaved: post.originalIsSaved ?? false,
                            isReposted: post.originalIsReposted ?? false,
                            createdAt: post.originalCreatedAt ?? null,
                            isDeleted: post.isOriginalPostDeleted ?? false,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Repeat2 size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">Chưa có bài viết nào đã đăng lại</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "saved" && isSelf && (
                <>
                  {loadingSavedPosts ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : savedPosts.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 animate-fadeIn">
                      {savedPosts.map((post) => (
                        <PostGridItem
                          key={post.id}
                          post={post}
                          onClick={() => {
                            setSelectedPost(post);
                            setShowSettingsMenu(false);
                            setShowPrivacySettings(false);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <BookmarkCheck size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">Chưa có bài viết nào đã lưu</p>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Modal for Post */}
            {selectedPost && (
              <PostDetailModal
                postId={selectedPost.id}
                repostId={selectedPost.repostId}
                onClose={handleClosePostModal}
                showSettingsMenu={showSettingsMenu}
                setShowSettingsMenu={setShowSettingsMenu}
                showPrivacySettings={showPrivacySettings}
                setShowPrivacySettings={setShowPrivacySettings}
              />
            )}
          </>
        )}

        <Footer />
      </div>

      {/* Modal hiển thị danh sách người theo dõi hoặc đang theo dõi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                    {followersData.followers.map((user) => (
                      <ModalUserItem
                        key={user.id}
                        user={user}
                        currentUserId={currentUser?.id}
                        onClose={closeModal}
                        isFollower={true}
                        isSelfProfile={isSelf}
                      />
                    ))}
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
                    {followingsData.followings.map((user) => (
                      <ModalUserItem
                        key={user.id}
                        user={user}
                        currentUserId={currentUser?.id}
                        onClose={closeModal}
                        isFollower={false}
                        isSelfProfile={isSelf}
                      />
                    ))}
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

      {/* Modal Privacy Settings */}
      {showUserPrivacyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold">Cài đặt quyền riêng tư</h2>
              <button
                onClick={() => setShowUserPrivacyModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Tài khoản riêng tư */}
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Tài khoản riêng tư</h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Chỉ những người bạn chấp nhận theo dõi mới thấy bài viết của bạn
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={userPrivacySettings.isPrivate}
                    onChange={(e) =>
                      setUserPrivacySettings({
                        ...userPrivacySettings,
                        isPrivate: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4 md:pt-6 space-y-4 md:space-y-5">
                {/* Ai có thể nhắn tin cho bạn */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                    Ai có thể nhắn tin cho bạn?
                  </label>
                  <select
                    value={userPrivacySettings.whoCanMessage}
                    onChange={(e) =>
                      setUserPrivacySettings({
                        ...userPrivacySettings,
                        whoCanMessage: e.target.value,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                  >
                    <option value="everyone">Mọi người</option>
                    <option value="followers">Chỉ người theo dõi</option>
                    <option value="nobody">Không ai</option>
                  </select>
                </div>

                {/* Ai có thể gắn thẻ bạn */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                    Ai có thể gắn thẻ bạn?
                  </label>
                  <select
                    value={userPrivacySettings.whoCanTagMe}
                    onChange={(e) =>
                      setUserPrivacySettings({
                        ...userPrivacySettings,
                        whoCanTagMe: e.target.value,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                  >
                    <option value="everyone">Mọi người</option>
                    <option value="followers">Chỉ người theo dõi</option>
                    <option value="nobody">Không ai</option>
                  </select>
                </div>

                {/* Ai có thể tìm bạn bằng tên người dùng */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                    Ai có thể tìm bạn bằng tên người dùng?
                  </label>
                  <select
                    value={userPrivacySettings.whoCanFindByUsername}
                    onChange={(e) =>
                      setUserPrivacySettings({
                        ...userPrivacySettings,
                        whoCanFindByUsername: e.target.value,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                  >
                    <option value="everyone">Mọi người</option>
                    <option value="followers">Chỉ người theo dõi</option>
                    <option value="nobody">Không ai</option>
                  </select>
                </div>

                {/* Hiển thị trạng thái hoạt động */}
                <div className="flex items-start md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Hiển thị trạng thái hoạt động</h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Cho phép mọi người thấy khi bạn đang online
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={userPrivacySettings.showOnlineStatus}
                      onChange={(e) =>
                        setUserPrivacySettings({
                          ...userPrivacySettings,
                          showOnlineStatus: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowUserPrivacyModal(false)}
                className="w-full md:w-auto px-4 md:px-6 py-2 text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    // Normalize enum values before sending
                    const payload = {
                      isPrivate: Boolean(userPrivacySettings.isPrivate),
                      whoCanMessage: normalizePrivacyEnum(userPrivacySettings.whoCanMessage),
                      whoCanTagMe: normalizePrivacyEnum(userPrivacySettings.whoCanTagMe),
                      whoCanFindByUsername: normalizePrivacyEnum(userPrivacySettings.whoCanFindByUsername),
                      showOnlineStatus: Boolean(userPrivacySettings.showOnlineStatus),
                    };
                    await updatePrivacySettings(payload).unwrap();
                    toast.success("Đã cập nhật cài đặt quyền riêng tư");
                    setShowUserPrivacyModal(false);
                  } catch (error) {
                    toast.error(error?.data?.message || "Cập nhật thất bại");
                  }
                }}
                disabled={isUpdatingPrivacy}
                className="w-full md:w-auto px-4 md:px-6 py-2 text-sm md:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
              >
                {isUpdatingPrivacy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
