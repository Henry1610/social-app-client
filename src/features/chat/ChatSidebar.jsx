import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Users, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { useGetConversationsQuery } from "./api/chatApi";
import { selectCurrentUser } from "../auth/authSlice";
import { useChat } from "../../contexts/ChatContext";
import socketService from "../../services/socket";
import { formatOfflineTime } from "../../utils/formatTimeAgo";
import ConversationAvatars from "../../components/common/ConversationAvatars";
import CreateGroupModal from "./components/CreateGroupModal";
import { isUserActuallyOnline } from "../../utils/userStatusUtils";

const ChatSidebar = ({
  selectedConversation,
  onSelectConversation,
}) => {
  // ===== HOOKS & SELECTORS =====
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();
  const { openChat } = useChat();
  const isOnChatPage = location.pathname.startsWith('/chat');
  
  // ===== STATE =====
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // ===== API QUERIES =====
  const { data: conversationsData, isLoading, refetch } = useGetConversationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // ===== MEMOIZED VALUES =====
  const allConversations = useMemo(
    () => conversationsData?.data?.conversations || [],
    [conversationsData?.data?.conversations]
  );

  const conversations = useMemo(() => {
    if (!searchQuery?.trim()) {
      return allConversations;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allConversations.filter(conv => {
      const conversationName = conv.type === 'GROUP' 
        ? (conv.name || '')
        : (conv.members?.find(member => member.user.id !== currentUser?.id)?.user?.fullName || 
           conv.members?.find(member => member.user.id !== currentUser?.id)?.user?.username || '');
      
      return conversationName.toLowerCase().includes(query);
    });
  }, [allConversations, searchQuery, currentUser?.id]);

  // ===== HELPER FUNCTIONS =====
  // isUserActuallyOnline is imported from utils/userStatusUtils

  const getConversationName = useCallback((conv, otherMember) => {
    if (conv.type === 'GROUP') {
      return conv.name || '';
    }
    return otherMember?.user?.fullName || otherMember?.user?.username || 'Người dùng';
  }, []);

  const getLastMessagePreview = useCallback((lastMessage, conv, currentUserId) => {
    if (!lastMessage) return 'Bắt đầu cuộc trò chuyện';

    const isOwn = lastMessage.senderId === currentUserId;
    const isGroup = conv.type === 'GROUP';
    
    // Xử lý prefix
    let prefix = '';
    if (!lastMessage.isSystem) {
      if (isOwn) {
        prefix = 'Bạn: ';
      } else if (isGroup && lastMessage.sender) {
        const senderName = lastMessage.sender.fullName || lastMessage.sender.username || 'Hệ thống';
        prefix = `${senderName}: `;
      }
    }
    
    // Xử lý body
    let body = '';
    if (lastMessage.isRecalled) {
      body = 'Tin nhắn đã thu hồi';
    } else if (lastMessage.type === 'IMAGE') {
      body = 'đã gửi một ảnh';
    } else if (lastMessage.type === 'VIDEO') {
      body = 'đã gửi một video';
    } else if (lastMessage.type === 'FILE') {
      body = lastMessage.filename ? `đã gửi ${lastMessage.filename}` : 'đã gửi một file';
    } else {
      body = lastMessage.content || '';
    }
    
    return { prefix, body };
  }, []);

  // ===== SOCKET EVENT HANDLERS =====
  useEffect(() => {
    const handleUnreadCountUpdate = () => refetch();
    const handleConversationUpdate = () => refetch();

    socketService.on('chat:unread_count_update', handleUnreadCountUpdate);
    socketService.on('chat:conversation_updated', handleConversationUpdate);

    return () => {
      socketService.off('chat:unread_count_update', handleUnreadCountUpdate);
      socketService.off('chat:conversation_updated', handleConversationUpdate);
    };
  }, [refetch]);

  useEffect(() => {
    const handleTyping = (data) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: data.isTyping ? [data.userId] : []
        }));
      }
    };

    socketService.on('chat:user_typing', handleTyping);
    return () => socketService.off('chat:user_typing', handleTyping);
  }, [currentUser?.id]);

  useEffect(() => {
    const handleUserStatus = (data) => {
      const isOnline = isUserActuallyOnline(data);
      
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: isOnline
      }));
    };

    socketService.on('chat:user_status', handleUserStatus);
    return () => socketService.off('chat:user_status', handleUserStatus);
  }, []);

  // ===== INITIALIZE ONLINE USERS =====
  useEffect(() => {
    if (conversations.length > 0) {
      const initialOnlineUsers = {};
      conversations.forEach(conv => {
        conv.members?.forEach(member => {
          if (member.user.id !== currentUser?.id) {
            initialOnlineUsers[member.user.id] = isUserActuallyOnline(member.user);
          }
        });
      });
      setOnlineUsers(initialOnlineUsers);
    }
  }, [conversations, currentUser?.id]);

  // ===== PERIODIC ONLINE STATUS UPDATE =====
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const updated = { ...prev };
        conversations.forEach(conv => {
          conv.members?.forEach(member => {
            if (member.user.id !== currentUser?.id) {
              updated[member.user.id] = isUserActuallyOnline(member.user);
            }
          });
        });
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [conversations, currentUser?.id]);

  // ===== HANDLERS =====
  const handleConversationClick = (conv) => {
    if (isOnChatPage) {
      onSelectConversation(conv);
    } else {
      openChat({ 
        conversationId: conv.id, 
        conversation: conv 
      });
    }
  };

  const handleGroupCreated = (conversation) => {
    onSelectConversation(conversation);
    refetch();
  };

  // ===== RENDER =====
  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header */}
      <div className="pt-10 px-4 flex items-center justify-end">
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Tạo nhóm chat"
        >
          <Users className="w-7 h-7 text-gray-600" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Xóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="font-bold text-xl pt-4 px-2">Tin nhắn</div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 px-6 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-500">
            <p className="text-sm">
              Chats will appear here after you send or receive a message
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const otherMember = conv.members?.find(member => member.user.id !== currentUser?.id);
              const lastMessage = conv.messages?.[0];
              const unreadCount = conv._count?.messages || 0;
              const conversationName = getConversationName(conv, otherMember);
              const { prefix, body } = getLastMessagePreview(lastMessage, conv, currentUser?.id);
              const isSelected = selectedConversation?.id === conv.id;
              const hasUnread = unreadCount > 0 && !isSelected;
              const isDirectChat = conv.type === 'DIRECT';
              const showOnlineStatus = isDirectChat && otherMember?.user?.privacySettings?.showOnlineStatus !== false;
              const isUserOnline = onlineUsers[otherMember?.user?.id];

              return (
                <div
                  key={conv.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gray-100"
                      : hasUnread
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleConversationClick(conv)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {conv.type === 'GROUP' ? (
                      <ConversationAvatars members={conv.members} />
                    ) : (
                      <img
                        src={otherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                        alt={otherMember?.user?.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    
                    {/* Online status indicator */}
                    {isDirectChat && isUserOnline && showOnlineStatus && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    
                    {/* Unread count */}
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p 
                        className={`font-medium truncate ${hasUnread ? "text-gray-900 font-bold" : "text-gray-900"}`}
                        title={conversationName}
                      >
                        {conversationName}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-500">
                          {new Date(lastMessage.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {typingUsers[conv.id]?.length > 0 ? (
                        <span className="text-gray-500">đang nhập...</span>
                      ) : (
                        <span className={hasUnread ? 'font-semibold text-gray-900' : ''}>
                          {prefix}{body}
                        </span>
                      )}
                    </p>
                    
                    {/* Online/Offline status */}
                    {showOnlineStatus && (
                      <p className="text-xs text-gray-400 truncate">
                        {isUserOnline ? (
                          <></>
                        ) : (
                          <span>{formatOfflineTime(otherMember?.user?.lastSeen)}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default ChatSidebar;
