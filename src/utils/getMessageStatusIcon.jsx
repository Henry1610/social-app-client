import React from "react";
import { Check, CheckCheck } from "lucide-react";

/**
 * Tạo icon trạng thái tin nhắn (SENT, DELIVERED, READ)
 * @param {Object} params
 * @param {Object} params.message - Message object
 * @param {string} params.currentUserId - ID của user hiện tại
 * @param {Object} params.selectedConversation - Conversation hiện tại (có thể là GROUP hoặc DIRECT)
 * @param {Function} params.isLastMessageInConversation - Function kiểm tra xem message có phải là message cuối cùng không
 * @param {boolean} params.compact - Kích thước compact (nhỏ hơn) cho modal
 * @returns {JSX.Element} Icon component
 */
export const getMessageStatusIcon = ({
  message,
  currentUserId,
  selectedConversation,
  isLastMessageInConversation,
  compact = false,
}) => {
  const iconSize = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const avatarSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = compact ? 'text-[9px]' : 'text-xs';
  
  // Mặc định hiển thị icon SENT nếu không có trạng thái
  if (!message || message.senderId !== currentUserId) {
    return <Check className={`${iconSize} text-gray-400`} />;
  }

  // Nếu không có states hoặc không tìm thấy states của người nhận, hiển thị SENT
  if (!message.states || message.states.length === 0) {
    return <Check className={`${iconSize} text-gray-400`} />;
  }

  // Xử lý khác nhau cho direct chat và group chat
  if (selectedConversation?.type === 'GROUP') {
    // Group chat: DELIVERED nếu có ít nhất 1 người đã nhận, READ nếu có người đã xem
    const deliveredStates = message.states.filter(
      state => state.userId !== currentUserId && 
      (state.status.toLowerCase() === 'delivered' || state.status.toLowerCase() === 'read')
    );
    
    const readStates = message.states.filter(
      state => state.userId !== currentUserId && state.status.toLowerCase() === 'read'
    );
    
    if (readStates.length > 0 && isLastMessageInConversation(message)) {
      // Có người đã xem tin nhắn mới nhất - hiển thị avatar của người đã xem
      return (
        <div className="flex -space-x-1">
          {readStates.slice(0, 3).map((state, index) => {
            const member = selectedConversation.members?.find(m => m.user.id === state.userId);
            return (
              <div
                key={state.userId}
                className={`${avatarSize} rounded-full overflow-hidden border border-white shadow-sm`}
                style={{ zIndex: 10 - index }}
              >
                <img
                  src={member?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                  alt={member?.user?.username}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
          {readStates.length > 3 && (
            <div className={`${avatarSize} bg-gray-300 rounded-full flex items-center justify-center ${textSize} text-gray-600 border border-white shadow-sm`}>
              +
            </div>
          )}
        </div>
      );
    } else if (deliveredStates.length > 0) {
      // Có người đã nhận nhưng chưa ai xem - DELIVERED
      return <CheckCheck className={`${iconSize} text-gray-400`} />;
    } else {
      // Chưa ai nhận - SENT
      return <Check className={`${iconSize} text-gray-400`} />;
    }
  } else {
    // Direct chat: logic cũ
    const recipientState = message.states.find(
      (state) => state.userId !== currentUserId
    );
    if (!recipientState) {
      return <Check className={`${iconSize} text-gray-400`} />;
    }

    const status = recipientState.status.toLowerCase();
    switch (status) {
      case "sent":
        return <Check className={`${iconSize} text-gray-400`} />;
      case "delivered":
        return <CheckCheck className={`${iconSize} text-gray-400`} />;
      case "read":
        return <CheckCheck className={`${iconSize} text-blue-500`} />;
      default:
        return <Check className={`${iconSize} text-gray-400`} />;
    }
  }
};

export default getMessageStatusIcon;

