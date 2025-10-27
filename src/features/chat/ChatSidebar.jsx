import React, { useEffect, useState, useMemo } from "react";
import { Search, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "./chatApi";
import { selectCurrentUser } from "../auth/authSlice";
import socketService from "../../services/socket";
import { formatOfflineTime } from "../../utils/formatTimeAgo";

const ChatSidebar = ({
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}) => {
  // Lấy current user từ Redux store
  const currentUser = useSelector(selectCurrentUser);
  
  // Lấy danh sách conversations từ API
  const { data: conversationsData, isLoading, refetch } = useGetConversationsQuery();
  const conversations = useMemo(() => conversationsData?.data?.conversations || [], [conversationsData?.data?.conversations]);

  // State để track typing users theo conversation
  const [typingUsers, setTypingUsers] = useState({});
  
  // State để track online users
  const [onlineUsers, setOnlineUsers] = useState({});

  // Listen for unread count updates
  useEffect(() => {
    const handleUnreadCountUpdate = (data) => {
      // Refetch conversations to update unread counts
      refetch();
    };

    socketService.on('chat:unread_count_update', handleUnreadCountUpdate);

    return () => {
      socketService.off('chat:unread_count_update', handleUnreadCountUpdate);
    };
  }, [refetch]);

  // Listen for typing indicators
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

    return () => {
      socketService.off('chat:user_typing', handleTyping);
    };
  }, [currentUser?.id]);

  // Initialize online users from API data
  useEffect(() => {
    if (conversations.length > 0) {
      const initialOnlineUsers = {};
      conversations.forEach(conv => {
        conv.members?.forEach(member => {
          if (member.user.id !== currentUser?.id) {
            initialOnlineUsers[member.user.id] = member.user.isOnline || false;
          }
        });
      });
      setOnlineUsers(initialOnlineUsers);
    }
  }, [conversations, currentUser?.id]);

  // Listen for user status updates (online/offline)
  useEffect(() => {
    const handleUserStatus = (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: data.isOnline
      }));
    };

    socketService.on('chat:user_status', handleUserStatus);

    return () => {
      socketService.off('chat:user_status', handleUserStatus);
    };
  }, []);

  // Cập nhật thời gian offline theo thời gian thực (mỗi phút)
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render để cập nhật thời gian offline
      setOnlineUsers(prev => ({ ...prev }));
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header */}
      <div className="pt-10 px-4 flex items-center justify-end">
        <Edit className="w-7 h-7 text-gray-600 cursor-pointer justify-content-end" />
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="font-bold text-xl pt-4 px-2">Tin nhắn</div>
      </div>


      {/* Conversation List / Placeholder */}
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
            {conversations.map((  conv) => {
              // Lấy thông tin người chat (không phải user hiện tại)
              const otherMember = conv.members?.find(member => 
                member.user.id !== currentUser?.id
              );
              const lastMessage = conv.messages?.[0];
              
              // Sử dụng unread count từ backend
              const unreadCount = conv._count?.messages || 0;
              
              return (
                <div
                  key={conv.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => onSelectConversation(conv)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={otherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                      alt={otherMember?.user?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {/* Online status indicator */}
                    {onlineUsers[otherMember?.user?.id] && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9' : unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {otherMember?.user?.fullName || otherMember?.user?.username}
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
                        <span className=" text-gray-500">
                          đang nhập...
                        </span>
                      ) : lastMessage ? (
                        <>
                          <span className={unreadCount > 0 ? "font-semibold text-gray-900" : ""}>
                            {lastMessage.senderId === currentUser?.id ? "Bạn: " : ""}
                            {lastMessage.content}
                          </span>
                        </>
                      ) : (
                        "Bắt đầu cuộc trò chuyện"
                      )}
                    </p>
                    
                    {/* Online/Offline status */}
                    <p className="text-xs text-gray-400 truncate">
                      {onlineUsers[otherMember?.user?.id] ? (
                        <span className="text-green-500">Đang hoạt động</span>
                      ) : (
                        <span>{formatOfflineTime(otherMember?.user?.lastSeen)}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
