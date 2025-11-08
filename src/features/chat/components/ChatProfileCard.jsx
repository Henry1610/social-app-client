import React from "react";

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
}) => {
  const isGroup = conversationType === 'GROUP';

  return (
    <div className="flex-shrink-0 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            {isGroup ? (
              // Group avatar - hiển thị avatar của 3 thành viên thành hình tam giác
              <div className="w-20 h-20 relative">
                {members
                  ?.slice(0, 3)
                  ?.map((member, index) => {
                    // Vị trí tam giác đè lên nhau
                    const positions = [
                      'absolute top-0 left-1/2 transform -translate-x-1/2 z-10', // Avatar 1: trên cùng, giữa
                      'absolute bottom-0 left-0 z-20', // Avatar 2: dưới trái, đè lên avatar 1
                      'absolute bottom-0 right-0 z-30'  // Avatar 3: dưới phải, đè lên avatar 1
                    ];
                    
                    return (
                      <div
                        key={member.user.id}
                        className={`w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg ${positions[index]}`}
                      >
                        <img
                          src={member.user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                          alt={member.user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                {members?.length > 3 && (
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg text-gray-600 border-4 border-white shadow-lg z-40">
                    +
                  </div>
                )}
              </div>
            ) : (
              // Direct chat avatar
              <img
                src={userInfo?.avatarUrl}
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

