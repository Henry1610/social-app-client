import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../auth/authSlice";
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
} from "./profileApi";
import { useParams } from "react-router-dom";
import {
  Grid,
  Play,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  X,
  Loader,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import confirmToast from "../../components/common/confirmToast";
import Footer from "../../components/layouts/Footer";
import FollowButton from "../../components/common/FollowButton";
import ModalUserItem from "./ModalUserItem";
import ModalSkeleton from "../../components/common/ModalSkeleton";
export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "followers" hoặc "following"
  const currentUser = useSelector(selectCurrentUser);
  const { username: routeUsername } = useParams();
  const viewingUsername = routeUsername || currentUser?.username;

  const isSelf =
    viewingUsername &&
    currentUser?.username &&
    viewingUsername === currentUser.username;

  const { data: publicProfileData } = useGetPublicProfileQuery(
    viewingUsername,
    { skip: !viewingUsername || isSelf }
  );
  const profileUser = isSelf
    ? currentUser
    : publicProfileData?.user || currentUser;

  const { data: statsData } = useGetFollowStatsQuery(viewingUsername, {
    skip: !viewingUsername,
  });
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

  const isPrivate = profileUser.privacySettings?.isPrivate;

  // Mở modal danh sách người theo dõi hoặc đang theo dõi
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
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

  const posts = [
    {
      id: 1,
      image: "https://source.unsplash.com/random/800x800?book",
      caption: "Reading time 📚",
    },
    {
      id: 2,
      image: "https://source.unsplash.com/random/800x800?library",
      caption: "Cozy corner",
    },
    {
      id: 3,
      image: "https://source.unsplash.com/random/800x800?coffee",
      caption: "Morning vibes ☕",
    },
    {
      id: 4,
      image: "https://source.unsplash.com/random/800x800?coding",
      caption: "Late night code",
    },
    {
      id: 5,
      image: "https://source.unsplash.com/random/800x800?desk",
      caption: "Workspace goals",
    },
    {
      id: 6,
      image: "https://source.unsplash.com/random/800x800?travel",
      caption: "Adventure mode ✈️",
    },
  ];

  return (
    <div className=" ml-[var(--feed-sidebar-width)] flex flex-1  justify-center">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-12 mb-12">
          {/* Avatar */}
          <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
            <img
              src={profileUser?.avatarUrl}
              alt={profileUser?.username}
              className="w-full h-full object-cover"
            />
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
                <div className="grid grid-cols-4 gap-1 animate-fadeIn">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer aspect-square overflow-hidden bg-gray-100"
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition duration-300 text-white flex gap-6 text-xl">
                          <div className="flex items-center gap-1">
                            <Heart size={20} />
                            <span className="text-sm">2.3k</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={20} />
                            <span className="text-sm">45</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reels" && (
                <div className="grid grid-cols-4 gap-1 animate-fadeIn">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer aspect-square overflow-hidden bg-gray-100"
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
                        <Play
                          className="text-white opacity-0 group-hover:opacity-100 transition duration-300"
                          size={40}
                          fill="white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "tagged" && (
                <div className="grid grid-cols-4 gap-1 animate-fadeIn">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer aspect-square overflow-hidden bg-gray-100"
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
                        <Tag
                          className="text-white opacity-0 group-hover:opacity-100 transition duration-300"
                          size={40}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal for Post */}
            {selectedPost && (
              <div
                className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedPost(null)}
              >
                <div
                  className="bg-white rounded-lg overflow-hidden max-w-5xl w-full shadow-2xl flex border border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <img
                      src={selectedPost.image}
                      alt=""
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="w-96 p-6 border-l border-gray-300 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-300">
                      <img
                        src="https://i.pravatar.cc/300"
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-semibold">john_doe</span>
                      <button className="ml-auto text-gray-600 hover:text-gray-900">
                        •••
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-6 pb-6 border-b border-gray-300">
                      <div className="flex gap-3 mb-4">
                        <img
                          src="https://i.pravatar.cc/300"
                          alt=""
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">john_doe</span>{" "}
                            {selectedPost.caption}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            2 ngày trước
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4 text-gray-700">
                      <Heart
                        size={22}
                        className="hover:text-gray-900 cursor-pointer transition"
                      />
                      <MessageCircle
                        size={22}
                        className="hover:text-gray-900 cursor-pointer transition"
                      />
                      <Share2
                        size={22}
                        className="hover:text-gray-900 cursor-pointer transition"
                      />
                    </div>

                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 mb-1">
                        1,234 lượt thích
                      </p>
                      <p className="font-semibold text-gray-900 mb-2">
                        {selectedPost.caption}
                      </p>
                      <p className="text-gray-600">Xem tất cả 28 bình luận</p>
                    </div>
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
                    {followersData.followers.map((user) => 
                  {console.log(user);
                  return (
                      <ModalUserItem
                        key={user.id}
                        user={user}
                        currentUserId={currentUser?.id}
                        onClose={closeModal}
                        isFollower={true}
                        isSelfProfile={isSelf}
                      />
                    )})}
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
                    {followingsData.followings.map((user) => 
                    
                    {console.log(user);
                    return (
                      <ModalUserItem
                        key={user.id}
                        user={user}
                        currentUserId={currentUser?.id}
                        onClose={closeModal}
                        isFollower={false}
                        isSelfProfile={isSelf}
                      />
                    )})}
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
