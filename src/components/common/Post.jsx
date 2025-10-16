function Post({
  id,
  user,
  media = [],
  content = "",
  createdAt,
  likes = 0,
  commentsCount = 0,
}) {
  // Giả định user = { username, fullName, avatar, verified }
  // media = [{ url: "...", type: "image" }]
  // createdAt là dạng ISO string hoặc Date

  const timeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000; // giây
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)} ngày`;
  };

  return (
    <article className="mb-6 border-b border-gray-200 max-w-[500px] mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
            <img
              src={user?.avatar || "https://via.placeholder.com/150"}
              alt={user?.username}
              className="w-full h-full rounded-full border-2 border-white object-cover"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{user?.username}</span>
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
        </div>
        <button className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

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

      {/* Post Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button className="hover:text-gray-500">❤️</button>
          <button className="hover:text-gray-500">💬</button>
          <button className="hover:text-gray-500">📤</button>
        </div>
        <button className="hover:text-gray-500">🔖</button>
      </div>

      {/* Likes */}
      <div className="mb-2">
        <span className="font-semibold text-sm">
          {likes.toLocaleString()} lượt thích
        </span>
      </div>

      {/* Caption */}
      {content && (
        <div className="mb-2">
          <span className="font-semibold text-sm">{user?.username} </span>
          <span className="text-sm">{content}</span>
          <button className="text-gray-500 text-sm ml-1">... xem thêm</button>
        </div>
      )}

      {/* Comments */}
      <button className="text-gray-500 text-sm mb-2">Xem bản dịch</button>
      <button className="text-gray-500 text-sm mb-4">
        Xem tất cả {commentsCount} bình luận
      </button>
    </article>
  );
}

export default Post;
