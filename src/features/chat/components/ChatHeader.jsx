import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, LogOut } from "lucide-react";

/**
 * ChatHeader - Header của chat với avatar, tên và action buttons
 * @param {Object} props
 * @param {Object} props.selectedConversation - Conversation hiện tại
 * @param {Object} props.displayUserInfo - Thông tin user để hiển thị
 * @param {string} props.username - Username từ URL
 * @param {Function} props.onViewMembers - Callback khi click xem members (cho group)
 * @param {Function} props.onAddMember - Callback khi click thêm member
 * @param {Function} props.onLeaveGroup - Callback khi click rời nhóm
 */
const ChatHeader = ({
  selectedConversation,
  displayUserInfo,
  username,
  onViewMembers,
  onAddMember,
  onLeaveGroup,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        {selectedConversation?.type === 'GROUP' ? (
          <button 
            type="button" 
            onClick={onViewMembers}
            className="w-10 h-10 relative focus:outline-none hover:opacity-80 transition-opacity"
          >
            {selectedConversation.members?.slice(0, 3)?.map((member, index) => {
              const positions = [
                'absolute top-0 left-1/2 transform -translate-x-1/2 z-10',
                'absolute bottom-0 left-0 z-20',
                'absolute bottom-0 right-0 z-30'
              ];
              return (
                <div
                  key={member.user.id}
                  className={`w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-md ${positions[index]}`}
                >
                  <img
                    src={member.user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                    alt={member.user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
            {selectedConversation.members?.length > 3 && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 border-2 border-white shadow-md z-40">
                +
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/${displayUserInfo?.user?.username || username}`)}
            className="w-10 h-10 rounded-full overflow-hidden ring-0 hover:ring-2 hover:ring-gray-200 transition"
            title={displayUserInfo?.user?.username || username}
          >
            <img
              src={displayUserInfo?.user?.avatarUrl}
              alt={displayUserInfo?.user?.username || username}
              className="w-10 h-10 object-cover"
            />
          </button>
        )}
        <div className="flex-1 space-y-[0.3px]">
          <h3 className="font-medium text-gray-900 text-md">
            {selectedConversation?.type === 'GROUP' 
              ? selectedConversation.name || ''
              : displayUserInfo?.user?.fullName
            }
          </h3>
          <p className="text-xs text-gray-600">
            {selectedConversation?.type === 'GROUP' 
              ? `${selectedConversation.members?.length || 0} thành viên`
              : displayUserInfo?.user?.username
            }
          </p>
        </div>
        
        {/* Group chat actions */}
        {selectedConversation?.type === 'GROUP' && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onAddMember}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Thêm thành viên"
            >
              <UserPlus className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onLeaveGroup}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
              title="Rời nhóm"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;

