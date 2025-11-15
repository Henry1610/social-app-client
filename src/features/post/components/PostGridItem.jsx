import { MessageCircle, Heart, Repeat2, Bookmark } from "lucide-react";

const PostGridItem = ({ post, onClick }) => {
  const previewImage = post.previewImage;
  const isRepost = post.isRepost;
  
  // Stats của repost (nếu là repost) hoặc stats thông thường
  const likeCount = isRepost ? (post.repostReactionCount || 0) : (post.reactionCount || 0);
  const commentCount = isRepost ? (post.repostCommentCount || 0) : (post.commentCount || 0);
  const repostsCount = post.repostsCount || 0;
  const savesCount = post.savesCount || 0;

  return (
    <div
      className={`relative group cursor-pointer aspect-square overflow-hidden bg-gray-100 ${
        isRepost ? 'border-2 border-blue-400' : ''
      }`}
      onClick={onClick}
    >
      {isRepost && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
          <Repeat2 size={12} />
          <span>Đã đăng lại</span>
        </div>
      )}
      
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
            <span className="text-sm">{commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat2 size={20} />
            <span className="text-sm">{repostsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark size={20} fill="currentColor" />
            <span className="text-sm">{savesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostGridItem;

