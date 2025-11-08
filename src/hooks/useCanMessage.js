import { useMemo } from "react";
import { useGetFollowStatusQuery } from "../features/profile/profileApi";

/**
 * Hook để kiểm tra xem user có thể nhắn tin cho target user hay không
 * @param {Object} params
 * @param {Object} params.selectedConversation - Conversation hiện tại
 * @param {Object} params.targetUser - User đang chat với
 * @param {Array} params.messages - Danh sách messages trong conversation
 * @param {boolean} params.isLoading - Loading state của user info
 * @param {boolean} params.isUsername - Có phải đang load từ username không
 * @returns {Object} { allowed: boolean, reason?: string }
 */
const useCanMessage = ({
  selectedConversation,
  targetUser,
  messages = [],
  isLoading = false,
  isUsername = false,
}) => {
  const targetUserId = targetUser?.id;

  // Get follow status if it's a 1-1 chat (not group)
  const { data: followStatus } = useGetFollowStatusQuery(
    targetUser?.username,
    { skip: !targetUser?.username || selectedConversation?.type === 'GROUP' }
  );

  const canMessage = useMemo(() => {
    // Group chat: luôn cho phép
    if (selectedConversation?.type === 'GROUP') {
      return { allowed: true };
    }

    // Không có target user: cho phép (fallback)
    if (!targetUserId) {
      return { allowed: true };
    }

    // Không có privacy settings: cho phép (trừ khi đang loading)
    if (!targetUser?.privacySettings) {
      if (isUsername && isLoading) {
        return { allowed: false, reason: 'Đang tải...' };
      }
      return { allowed: true };
    }

    const whoCanMessage = targetUser.privacySettings.whoCanMessage || 'everyone';

    // Nobody: chỉ cho phép nếu đã có message từ target user
    if (whoCanMessage === 'nobody') {
      const hasMessageFromTarget = messages.some(msg => msg.senderId === targetUserId);
      if (!hasMessageFromTarget) {
        return { 
          allowed: false, 
          reason: 'Không phải ai cũng có thể nhắn tin cho tài khoản này. Hãy liên hệ trực tiếp với họ để họ nhắn trước 1 dòng tin nhắn, sau đó bạn mới có thể bắt đầu cuộc trò chuyện.' 
        };
      }
      return { allowed: true };
    }

    // Followers: chỉ cho phép nếu đã follow
    if (whoCanMessage === 'followers') {
      if (!followStatus?.isFollowing) {
        return { allowed: false, reason: 'Bạn phải theo dõi người này để nhắn tin' };
      }
      return { allowed: true };
    }

    // Everyone: luôn cho phép
    if (whoCanMessage === 'everyone') {
      return { allowed: true };
    }

    // Default: cho phép
    return { allowed: true };
  }, [targetUser, targetUserId, followStatus, messages, selectedConversation?.type, isUsername, isLoading]);

  return canMessage;
};

export default useCanMessage;

