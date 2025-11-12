import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetFeedPostsQuery } from "../../features/post/api/postApi";
import PostDetailModal from "../../features/post/components/PostDetailModal";
import RightSidebar from "../../components/layouts/RightSideBar";
import Post from "../../features/post/components/Post";
import FloatingDirectMessage from "../../components/common/FloatingDirectMessage";
import HomeHeader from "../../components/layouts/HomeHeader";

function Home() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lấy danh sách posts từ feed API (posts từ users đang follow + chính mình)
  const { data: feedData, isLoading, error } = useGetFeedPostsQuery({ page: 1, limit: 20 });
  // Memoize posts để tránh re-render không cần thiết
  const posts = useMemo(() => feedData?.posts || [], [feedData?.posts]);

  /**
   * Mở post modal khi có postId trong URL (ví dụ: khi click vào notification)
   * Tự động tìm post trong danh sách hiện tại hoặc set postId để fetch từ API
   */
  useEffect(() => {
    const postIdFromUrl = searchParams.get('postId');
    if (!postIdFromUrl || selectedPost) return;

    const postId = Number(postIdFromUrl);
    const foundPost = posts.find(p => p.id === postId);
    if (foundPost) {
      setSelectedPost(foundPost);
    } else {
      // Nếu không tìm thấy trong danh sách, set postId để PostDetailModal fetch từ API
      setSelectedPost({ id: postId });
    }
  }, [searchParams, selectedPost, posts]);

  /**
   * Đóng post detail modal và xóa postId khỏi URL
   * Được gọi khi user click nút đóng hoặc click ra ngoài modal
   */
  const handleClosePostModal = () => {
    setSelectedPost(null);
    
    // Xóa postId khỏi URL để tránh modal tự mở lại khi refresh
    if (searchParams.get('postId')) {
      searchParams.delete('postId');
      setSearchParams(searchParams, { replace: true });
    }
  };


   // Mở post detail modal khi user click vào post
   // Cập nhật URL với postId để có thể share link hoặc refresh không mất state
  
  const handleOpenPostModal = (postId) => {
    const foundPost = posts.find(p => p.id === postId);
    if (foundPost) {
      // Nếu tìm thấy post trong danh sách, dùng luôn data đó
      setSelectedPost(foundPost);
      searchParams.set('postId', postId);
      setSearchParams(searchParams, { replace: true });
    } else {
      // Nếu không tìm thấy, set postId để PostDetailModal fetch từ API
      setSelectedPost({ id: postId });
      searchParams.set('postId', postId);
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="flex-1 feed-layout flex justify-center">
        {/* Feed Section */}
        <section className="flex-1 max-w-[700px] py-6 md:pt-6 pt-20">
        {/* Feed Posts */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải feed...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Lỗi khi tải feed. Vui lòng thử lại.</p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có bài viết nào trong feed của bạn.</p>
            <p className="text-gray-400 text-sm mt-2">Bắt đầu theo dõi mọi người để xem bài viết của họ!</p>
          </div>
        )}

        {!isLoading && !error && posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            user={{
              username: post.user?.username || "unknown",
              fullName: post.user?.fullName || "",
              avatar: post.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg",
              verified: false, // TODO: Add verified field to user model if needed
            }}
            media={post.media?.map(m => ({
              url: m.mediaUrl,
              type: m.mediaType?.toLowerCase() || "image"
            })) || []}
            content={post.content || ""}
            createdAt={post.createdAt}
            likes={post.reactionCount || 0}
            commentsCount={post.commentCount || 0}
            repostsCount={post.repostsCount || 0}
            savesCount={post.savesCount || 0}
            isLiked={post.isLiked || false}
            isSaved={post.isSaved || false}
            isReposted={post.isReposted || false}
            isRepost={post.isRepost || false}
            repostId={post.repostId || null}
            repostedBy={post.repostedBy || null}
            repostContent={post.repostContent || null}
            originalLikes={post.originalReactionCount || 0}
            originalCommentsCount={post.originalCommentCount || 0}
            originalRepostsCount={post.originalRepostsCount || 0}
            originalSavesCount={post.originalSavesCount || 0}
            originalIsLiked={post.originalIsLiked || false}
            originalIsSaved={post.originalIsSaved || false}
            originalIsReposted={post.originalIsReposted || false}
            originalCreatedAt={post.originalCreatedAt || null}
            onOpenPostModal={handleOpenPostModal}
          />
        ))}
      </section>

      {/* Right Sidebar */}
      <RightSidebar />
      <FloatingDirectMessage avatarUrl="/images/avatar-IG-mac-dinh-1.jpg" />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          postId={selectedPost.id}
          onClose={handleClosePostModal}
        />
      )}
      </main>
    </>
  );
}

export default Home;
