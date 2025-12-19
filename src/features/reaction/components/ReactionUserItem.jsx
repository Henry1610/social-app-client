import { useNavigate } from "react-router-dom";
import { 
  useGetFollowStatusQuery,
} from "../../profile/api/profileApi";
import FollowButton from "../../../components/common/FollowButton";
import { ModalSkeleton } from "../../../components/common/skeletons";
import { getReactionIcon } from "./ReactionIcons";

const ReactionUserItem = ({ user, reactionType, currentUserId, onClose }) => {
  const navigate = useNavigate();
  
  const { data: followStatus, isFetching: loadingFollowStatus, isLoading: initialLoading } = useGetFollowStatusQuery(user.username, {
    skip: user.id === currentUserId,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });

  const isSelf = user.id === currentUserId;

  if (initialLoading || loadingFollowStatus) {
    return <ModalSkeleton count={1} showButtons={true} />;
  }

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
        <div className="relative">
          <img
            src={user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          {reactionType && (() => {
            const IconComponent = getReactionIcon(reactionType);
            return (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 border-white">
                <IconComponent size={16} />
              </div>
            );
          })()}
        </div>
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
            isChatButtonVisible={false}
          />
        </div>
      )}
    </div>
  );
};

export default ReactionUserItem;

