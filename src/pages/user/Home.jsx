import { useMemo } from "react";
import { useGetFeedPostsQuery } from "../../features/post/api/postApi";
import RightSidebar from "../../components/layouts/RightSideBar";
import Post from "../../features/post/components/Post";
import FloatingDirectMessage from "../../components/common/FloatingDirectMessage";
import HomeHeader from "../../components/layouts/HomeHeader";
import { FeedSkeleton } from "../../components/common/skeletons";

function Home() {
  // Lấy danh sách posts từ feed API (posts từ users đang follow + chính mình)
  const { data: feedData, isLoading, error } = useGetFeedPostsQuery({ page: 1, limit: 20 });
  // Memoize posts để tránh re-render không cần thiết
  const posts = useMemo(() => feedData?.posts || [], [feedData?.posts]);

  return (
    <>
      <HomeHeader />
      <main className="flex-1 feed-layout flex justify-center w-full min-w-0">
        {/* Feed Section */}
        <section className="flex-1 max-w-[700px] w-full px-2 md:px-4 lg:px-0 pt-20 md:pt-6 pb-24 md:pb-6">
          {/* Feed Posts */}
          {isLoading && <FeedSkeleton count={5} />}

          {!isLoading && !error && posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có bài viết nào trong feed của bạn.</p>
              <p className="text-gray-400 text-sm mt-2">Bắt đầu theo dõi mọi người để xem bài viết của họ!</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                user={{
                  id: post.userId || post.user?.id,
                  username: post.user?.username || "unknown",
                  fullName: post.user?.fullName || "",
                  avatar: post.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg",
                  verified: false, // TODO: Add verified field to user model if needed
                }}
                media={post.media?.map(m => ({
                  mediaUrl: m.mediaUrl,
                  type: m.mediaType?.toLowerCase() || "image"
                })) || []}
                content={post.content || ""}
                createdAt={post.createdAt}
                likes={post.reactionCount || 0}
                commentsCount={post.commentCount || 0}
                repostsCount={post.repostsCount || 0}
                isLiked={post.isLiked || false}
                isReposted={post.isReposted || false}
                isSaved={post.isSaved || false}
                isRepost={post.isRepost || false}
                whoCanSee={post.whoCanSee || "everyone"}
                whoCanComment={post.whoCanComment || "everyone"}
                repostId={post.repostId || null}
                repostedBy={post.repostedBy || null}
                repostContent={post.repostContent || null}
                originalPost={post.isRepost ? {
                  likes: post.originalReactionCount || 0,
                  commentsCount: post.originalCommentCount || 0,
                  repostsCount: post.originalRepostsCount || 0,
                  savesCount: post.originalSavesCount || 0,
                  isLiked: post.originalIsLiked || false,
                  isSaved: post.originalIsSaved || false,
                  isReposted: post.originalIsReposted || false,
                  createdAt: post.originalCreatedAt || null,
                } : null}
              />
            ))}
            </div>
          )}
        </section>

      {/* Right Sidebar */}
      <div className="sticky top-0 self-start max-h-screen overflow-y-auto">
        <RightSidebar />
      </div>
      <FloatingDirectMessage avatarUrl="/images/avatar-IG-mac-dinh-1.jpg" />
      </main>
    </>
  );
}

export default Home;
