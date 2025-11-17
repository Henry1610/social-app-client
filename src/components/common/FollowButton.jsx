import { UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateConversationMutation } from "../../features/chat/api/chatApi";
import { 
  useFollowUserMutation, 
  useUnfollowUserMutation, 
  useCancelFollowRequestMutation,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useGetFollowStatusQuery
} from "../../features/profile/api/profileApi";
import confirmToast from "./confirmToast";

const FollowButton = ({
  followStatus: followStatusProp,
  viewingUsername,
  children, // Để truyền custom actions cho trường hợp isSelf
  isChatButtonVisible,
  size = "default" // "default" | "small"
}) => {
  // Tự fetch followStatus nếu không được truyền vào
  const { data: followStatusData } = useGetFollowStatusQuery(viewingUsername, {
    skip: !viewingUsername || followStatusProp !== undefined
  });
  
  const followStatus = followStatusProp !== undefined ? followStatusProp : followStatusData;
  const [createConversation, { isLoading: isCreatingConversation }] = useCreateConversationMutation();
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const [cancelFollowRequest, { isLoading: unrequesting }] = useCancelFollowRequestMutation();
  const [acceptFollowRequest, { isLoading: accepting }] = useAcceptFollowRequestMutation();
  const [rejectFollowRequest, { isLoading: rejecting }] = useRejectFollowRequestMutation();
  const navigate = useNavigate();

  // Xử lý khi nhấn nút nhắn tin
  const handleStartChat = async () => {
    
    
    if (!viewingUsername) {
      
      toast.error("Không thể lấy thông tin người dùng");
      return;
    }

    try {
      // Tạo conversation với username, backend sẽ tự tìm userId
      const result = await createConversation({
        type: 'DIRECT',
        participantUsername: viewingUsername // Truyền username thay vì userId
      }).unwrap();

      toast.success("Đã mở cuộc trò chuyện");
      
      // Dẫn đến trang chat với conversation ID
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

  // Nếu là chính mình, render children (custom actions)
  if (followStatus?.isSelf) {
    return <>{children}</>;
  }

  // Tính toán class size
  const sizeClasses = {
    default: {
      button: "px-5 py-2 text-sm",
      icon: 16,
      chatButton: "px-4 py-2 text-sm"
    },
    small: {
      button: "px-3 py-1 text-xs",
      icon: 14,
      chatButton: "px-3 py-1 text-xs"
    }
  };
  
  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Nếu có incoming request (người khác đã gửi follow request đến mình)
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
          className={`${currentSize.button} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2`}
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
          className={`${currentSize.button} bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition flex items-center gap-2`}
        >
          {rejecting ? "Đang xử lý..." : "Từ chối"}
        </button>
        
        {/* Nút Nhắn tin */}
        {isChatButtonVisible && (
          <button 
            onClick={handleStartChat}
            disabled={isCreatingConversation}
            className={`${currentSize.chatButton} bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition border-gray-300 flex items-center gap-2 disabled:opacity-50`}
          >
            <MessageCircle size={currentSize.icon} />
            <span className="hidden md:inline">
              {isCreatingConversation ? "Đang tạo..." : "Nhắn tin"}
            </span>
          </button>
        )}
        
      </div>
    );
  }

  // Handler cho follow/unfollow với confirm toast khi unfollow
  const handleFollowToggle = async () => {
    if (following || unfollowing || unrequesting) return;

    try {
      if (followStatus?.isFollowing) {
        // Hiển thị confirm toast trước khi unfollow
        const confirm = await confirmToast("Bạn có chắc chắn muốn hủy theo dõi?");
        if (!confirm) return;
        
        await unfollowUser(viewingUsername).unwrap();
        toast.info("Đã hủy theo dõi");
      } else if (followStatus?.isPending) {
        // Hủy yêu cầu theo dõi
        const confirm = await confirmToast("Hủy yêu cầu theo dõi?");
        if (!confirm) return;
        
        await cancelFollowRequest(viewingUsername).unwrap();
        toast.info("Đã hủy yêu cầu theo dõi");
      } else {
        // Follow user
        const result = await followUser(viewingUsername).unwrap();
        toast.success(result.message || "Đã theo dõi người dùng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  // Trường hợp bình thường (follow/unfollow)
  return (
    <div className="flex items-center gap-2">
      {/* Nút Follow với 3 trạng thái */}
      <button
        onClick={handleFollowToggle}
        disabled={following || unfollowing || unrequesting}
        className={`${currentSize.button} rounded-lg font-semibold transition flex items-center gap-2
            ${
              followStatus?.isFollowing
              ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
              : followStatus?.isPending
              ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
              : "bg-primary-btn hover:bg-primary-btn-hover text-white"
            }`}
      >
        {followStatus?.isFollowing ? (
          <UserMinus size={currentSize.icon} />
        ) : (
          <UserPlus size={currentSize.icon} />
        )}
        <span className="hidden md:inline">
          {followStatus?.isFollowing
            ? "Đang theo dõi"
            : followStatus?.isPending
            ? "Đã yêu cầu"
            : followStatus?.isFollower
            ? "Theo dõi lại"
            : "Theo dõi"}
        </span>
      </button>

      {/* Nút Nhắn tin */}
      {isChatButtonVisible && (
        <button 
          onClick={handleStartChat}
          disabled={isCreatingConversation}
          className={`${currentSize.chatButton} bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition border-gray-300 flex items-center gap-2 disabled:opacity-50`}
        >
          <MessageCircle size={currentSize.icon} />
          <span className="hidden md:inline">
            {isCreatingConversation ? "Đang tạo..." : "Nhắn tin"}
          </span>
        </button>
      )}
    </div>
  );
};

export default FollowButton;