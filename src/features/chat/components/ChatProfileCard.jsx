import React from "react";
import ConversationAvatars from "../../../components/common/ConversationAvatars";

/**
 * ChatProfileCard - Component hiển thị avatar và thông tin user/conversation ở đầu chat
 * @param {Object} props
 * @param {Object} props.userInfo - Thông tin user (cho direct chat)
 * @param {string} props.conversationType - Loại conversation: 'GROUP' hoặc 'DIRECT'
 * @param {Array} props.members - Danh sách thành viên (cho group)
 * @param {string} props.conversationName - Tên conversation (cho group)
 * @param {Function} props.onViewProfile - Callback khi click xem trang cá nhân (cho direct chat)
 * @param {Function} props.onViewMembers - Callback khi click xem thông tin nhóm (cho group)
 */
const ChatProfileCard = ({
  userInfo,
  conversationType = 'DIRECT',
  members = [],
  conversationName = '',
  onViewProfile,
  onViewMembers,
  compact = false,
}) => {
  const isGroup = conversationType === 'GROUP';

  if (compact) {
    // Compact version for modal
    return (
      <div className="flex-shrink-0 py-2">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Avatar */}
          <div className="relative">
            {isGroup ? (
              <ConversationAvatars 
                members={members} 
                size={compact ? 48 : 80} 
                borderWidth={compact ? 2 : 4} 
              />
            ) : (
              <img
                src={userInfo?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                alt={userInfo?.username}
                className={`${compact ? 'w-12 h-12 border-2' : 'w-20 h-20 border-4'} rounded-full object-cover border-gray-100`}
              />
            )}
          </div>

          {/* User Info */}
          <div className="space-y-0.5">
            <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 truncate max-w-full px-2`}>
              {isGroup ? conversationName : userInfo?.fullName || userInfo?.username}
            </h3>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 flex items-center justify-center gap-1`}>
              {isGroup 
                ? `${members?.length || 0} thành viên`
                : `@${userInfo?.username}`
              }
            </p>
          </div>

          {/* Action Button - Compact version */}
          <button 
            onClick={isGroup ? onViewMembers : onViewProfile}
            className={`${compact ? 'text-xs py-1.5 px-3' : 'text-sm py-2 px-4'} bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors mt-1`}
          >
            {isGroup ? 'Xem thông tin nhóm' : 'Xem trang cá nhân'}
          </button>
        </div>
      </div>
    );
  }

  // Full version for full page
  return (
    <div className="flex-shrink-0 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            {isGroup ? (
              <ConversationAvatars 
                members={members} 
                size={80} 
                borderWidth={4} 
              />
            ) : (
              // Direct chat avatar
              <img
                src={userInfo?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                alt={userInfo?.username}
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
              />
            )}
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {isGroup ? conversationName : userInfo?.fullName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              {isGroup 
                ? `${members?.length || 0} thành viên`
                : `@${userInfo?.username}`
              }
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Instagram
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex">
            <button 
              onClick={isGroup ? onViewMembers : onViewProfile}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {isGroup ? 'Xem thông tin nhóm' : 'Xem trang cá nhân'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatProfileCard;

