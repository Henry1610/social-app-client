import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../auth/authSlice";
import {
  useGetFollowStatsQuery,
  useGetPublicProfileQuery,
  useGetFollowStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCancelFollowRequestMutation,
} from "./profileApi";
import { useParams } from "react-router-dom";
import {
  Grid,
  Play,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserMinus,
  Lock,
} from "lucide-react";
import Footer from "../../components/layouts/Footer";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
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

  const { data: followStatus, isFetching: loadingStatus } =
    useGetFollowStatusQuery(viewingUsername, { skip: !viewingUsername });
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const [cancelFollowRequest, { isLoading: unrequesting }] =
    useCancelFollowRequestMutation();

  const isPrivate = profileUser.privacySettings?.isPrivate;
  const isFollowing = followStatus?.isFollowing;
  console.log("profileUser", currentUser);

  const onFollowToggle = async () => {
    if (!viewingUsername || followStatus?.isSelf) return;
    try {
      if (followStatus?.isFollowing) {
        await unfollowUser(viewingUsername).unwrap();
      } else if (followStatus?.isPending) {
        await cancelFollowRequest(viewingUsername).unwrap();
      } else {
        await followUser(viewingUsername).unwrap();
      }
    } catch (e) {
      // noop
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

              {followStatus?.isSelf ? (
                <>
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition border border-gray-300">
                    Chỉnh sửa trang cá nhân
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    ⚙️
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Nút Follow với 3 trạng thái */}
                  <button
                    onClick={onFollowToggle}
                    disabled={
                      following || unfollowing || unrequesting || loadingStatus
                    }
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition border border-gray-300 flex items-center gap-2
                                ${
                                  followStatus?.isFollowing
                                    ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                    : followStatus?.isPending
                                    ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
                                    : "bg-[#0095F6] hover:bg-[#1877F2] text-white"
                                }`}
                  >
                    {followStatus?.isFollowing ? (
                      <UserMinus size={16} />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {followStatus?.isFollowing
                      ? "Đang theo dõi"
                      : followStatus?.isPending
                      ? "Đã gửi yêu cầu"
                      : "Theo dõi"}
                  </button>

                  {/* Nút Nhắn tin (chỉ hiển thị khi đã follow hoặc tài khoản công khai) */}
                  {(!followStatus?.isPrivate || followStatus?.isFollowing) && (
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition border-gray-300 flex items-center gap-2">
                      Nhắn tin
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Thống kê */}
            <div className="flex gap-10 mb-6 text-base">
              <span>
                <strong>{postCount}</strong>{" "}
                <span className="text-gray-400">bài viết</span>
              </span>
              <span>
                <strong>{followerCount}</strong>{" "}
                <span className="text-gray-400">người theo dõi</span>
              </span>
              <span>
                <span className="text-gray-400">Đang theo dõi</span>{" "}
                <strong>{followingCount}</strong>{" "}
                <span className="text-gray-400">người dùng</span>
              </span>
            </div>

            
          </div>
        </div>

        {!isSelf && isPrivate && !isFollowing ? (
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
    </div>
  );
}
