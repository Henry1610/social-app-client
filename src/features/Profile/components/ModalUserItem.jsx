import { useNavigate } from "react-router-dom";
import { 
  useFollowUserMutation, 
  useUnfollowUserMutation, 
  useGetFollowStatusQuery,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useRemoveFollowerMutation
} from "../profileApi";
import { toast } from "react-hot-toast";
import FollowButton from "./FollowButton";
import confirmToast from "../../../components/common/confirmToast";
import { ModalSkeleton } from "../../../components/common/skeletons";

const ModalUserItem = ({ user, currentUserId, onClose, isFollower = false, isSelfProfile = false }) => {
  const navigate = useNavigate();
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const [acceptFollowRequest, { isLoading: accepting }] = useAcceptFollowRequestMutation();
  const [rejectFollowRequest, { isLoading: rejecting }] = useRejectFollowRequestMutation();
  const [removeFollower, { isLoading: removing }] = useRemoveFollowerMutation();
  
  // Sử dụng RTK Query cache thay vì local state
  const { data: followStatus, isFetching: loadingFollowStatus, isLoading: initialLoading } = useGetFollowStatusQuery(user.username, {
    skip: user.id === currentUserId, // Skip nếu là chính mình
    refetchOnMountOrArgChange: false, // Không refetch khi component mount lại
    refetchOnFocus: false, // Không refetch khi focus
    refetchOnReconnect: false // Không refetch khi reconnect
  });

  const isSelf = user.id === currentUserId;

  if (initialLoading || loadingFollowStatus) {
    return <ModalSkeleton count={1} showButtons={true} />;
  }

  const handleFollowToggle = async () => {
    if (following || unfollowing) return; 
    
    try {
      if (followStatus?.isFollowing) {
        await unfollowUser(user.username).unwrap();
        toast.success("Đã hủy theo dõi!");
      } else {
        await followUser(user.username).unwrap();
        toast.success("Đã theo dõi!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleRemoveFollower = async () => {
    if (removing) return;
    
    // Xác nhận trước khi xóa
    const confirm = await confirmToast(
      `Xóa ${user.username} khỏi danh sách ?`
    );
    
    if (!confirm) return;
    
    try {
      await removeFollower(user.username).unwrap();
      toast.success("Đã xóa người theo dõi!");
      // Không đóng modal, để người dùng thấy kết quả
    } catch (error) {
      toast.error("Không thể xóa người theo dõi!");
    }
  };

  const handleUserClick = () => {
    onClose();
    navigate(`/${user.username}`);
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
      <div 
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={handleUserClick}
      >
        <img
          src={user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{user.username}</p>
          <p className="text-gray-500 text-sm">{user.fullName}</p>
        </div>
      </div>
      
      {!isSelf && (
        <div className="flex items-center gap-2">
          <FollowButton
            followStatus={followStatus}
            viewingUsername={user.username}
            following={following}
            unfollowing={unfollowing}
            unrequesting={false}
            loadingStatus={loadingFollowStatus}
            onFollowToggle={handleFollowToggle}
            acceptFollowRequest={acceptFollowRequest}
            rejectFollowRequest={rejectFollowRequest}
            accepting={accepting}
            rejecting={rejecting}
            isChatButton={false}
          />
          
          {/* Nút xóa follower - chỉ hiện khi là follower và đang xem profile của chính mình */}
          {isFollower && isSelfProfile && (
            <button
              onClick={handleRemoveFollower}
              disabled={removing}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              {removing ? "Đang xóa..." : "Xóa"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModalUserItem;
