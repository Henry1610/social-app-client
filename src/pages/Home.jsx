import RightSidebar from "../components/layouts/RightSideBar";
import Post from "../components/common/Post";
import FloatingDirectMessage from "../components/common/FloatingDirectMessage";
function Home() {
  return (
    <main className="flex-1 ml-[var(--feed-sidebar-width)] flex justify-center">
      {/* Feed Section */}
      <section className="flex-1 max-w-[700px] py-6">
        {/* Stories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide justify-center">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[3px]">
                <div className="w-full h-full rounded-full border-2 border-white bg-gray-200" />
              </div>
              <span className="text-xs mt-1">user{i}</span>
            </div>
          ))}
        </div>

        {/* Single Post */}
        <Post
          id={1}
          user={{
            username: "arsenal",
            fullName: "Arsenal FC",
            avatar: "/images/avatar-IG-mac-dinh-1.jpg",
            verified: true,
          }}
          media={[
            {
              url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=600",
            },
          ]}
          content="Starting as we mean to go on "
          createdAt="2025-10-14T10:00:00Z"
          likes={67357}
          commentsCount={156}
        />
      </section>

      {/* Right Sidebar */}
      <RightSidebar />
      <FloatingDirectMessage avatarUrl="/images/avatar-IG-mac-dinh-1.jpg" />
    </main>
  );
}

export default Home;
