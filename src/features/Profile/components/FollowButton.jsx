import { UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateConversationMutation } from "../../../features/chat/chatApi";

const FollowButton = ({
  followStatus,
  viewingUsername,
  following,
  unfollowing,
  unrequesting,
  loadingStatus,
  onFollowToggle,
  acceptFollowRequest,
  rejectFollowRequest,
  accepting,
  rejecting,
  children,
  isChatButtonVisible
}) => {
  const [createConversation, { isLoading: isCreatingConversation }] = useCreateConversationMutation();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    if (!viewingUsername) {
      toast.error("Không thể lấy thông tin người dùng");
      return;
    }

    try {
      const result = await createConversation({
        type: 'DIRECT',
        participantUsername: viewingUsername
      }).unwrap();

      toast.success("Đã mở cuộc trò chuyện");
      
      const conversationId = result.data?.conversation?.id;
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      } else {
        console.error('Không có conversation ID trong response');
        toast.error("Không thể lấy ID cuộc trò chuyện");
      }
    } catch (error) {
      console.error('Lỗi khi tạo conversation:', error);
      toast.error("Không thể tạo cuộc trò chuyện");
    }
  };

  if (followStatus?.isSelf) {
    return <>{children}</>;
  }

  if (followStatus?.hasIncomingRequest) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            try {
              await acceptFollowRequest(viewingUsername).unwrap();
              toast.success("Đã chấp nhận lời mời theo dõi!");
            } catch {
              toast.error("Không thể chấp nhận yêu cầu này!");
            }
          }}
          disabled={accepting}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          {accepting ? "Đang xử lý..." : "Chấp nhận"}
        </button>
        <button
          onClick={async () => {
            try {
              await rejectFollowRequest(viewingUsername).unwrap();
              toast.success("Đã từ chối lời mời theo dõi!");
            } catch {
              toast.error("Không thể từ chối yêu cầu này!");
            }
          }}
          disabled={rejecting}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          {rejecting ? "Đang xử lý..." : "Từ chối"}
        </button>
        
        {isChatButtonVisible && (
          <button 
            onClick={handleStartChat}
            disabled={isCreatingConversation}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition border-gray-300 flex items-center gap-2 disabled:opacity-50"
          >
            <MessageCircle size={16} />
            {isCreatingConversation ? "Đang tạo..." : "Nhắn tin"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onFollowToggle}
        disabled={following || unfollowing || unrequesting || loadingStatus}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
            ${
              followStatus?.isFollowing
              ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
              : followStatus?.isPending
              ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
              : "bg-primary-btn hover:bg-primary-btn-hover text-white"
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
          ? "Đã yêu cầu"
          : followStatus?.isFollower
          ? "Theo dõi lại"
          : "Theo dõi"}
      </button>

      {isChatButtonVisible && (
        <button 
          onClick={handleStartChat}
          disabled={isCreatingConversation}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition border-gray-300 flex items-center gap-2 disabled:opacity-50"
        >
          <MessageCircle size={16} />
          {isCreatingConversation ? "Đang tạo..." : "Nhắn tin"}
        </button>
      )}
    </div>
  );
};

export default FollowButton;

