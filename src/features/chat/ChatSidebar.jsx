import React, { useEffect, useState, useMemo } from "react";
import { Search, Edit, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "./chatApi";
import { selectCurrentUser } from "../auth/authSlice";
import socketService from "../../services/socket";
import { formatOfflineTime } from "../../utils/formatTimeAgo";
import CreateGroupModal from "./components/CreateGroupModal";

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
  const allConversations = useMemo(() => conversationsData?.data?.conversations || [], [conversationsData?.data?.conversations]);
  
  const conversations = useMemo(() => {
    if (!searchQuery?.trim()) {
      return allConversations;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return allConversations.filter(conv => {
      const conversationName = conv.type === 'GROUP' 
        ? (conv.name || conv.members
            ?.filter(member => member.user.id !== currentUser?.id)
            ?.map(member => member.user.fullName || member.user.username)
            ?.join(' ') || '')
        : (conv.members?.find(member => member.user.id !== currentUser?.id)?.user?.fullName || 
           conv.members?.find(member => member.user.id !== currentUser?.id)?.user?.username || '');
      
      return conversationName.toLowerCase().includes(query);
    });
  }, [allConversations, searchQuery, currentUser?.id]);

  // State để track typing users theo conversation
  const [typingUsers, setTypingUsers] = useState({});
  
  // State để track online users
  const [onlineUsers, setOnlineUsers] = useState({});
  
  // State cho modal tạo nhóm
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    const handleUnreadCountUpdate = (data) => {
      refetch();
    };

    const handleConversationUpdate = (data) => {
      refetch();
    };

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
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Tạo nhóm chat"
        >
          <Edit className="w-7 h-7 text-gray-600" />
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-10 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Xóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
              
              // Xử lý hiển thị tên conversation
              const getConversationName = () => {
                if (conv.type === 'GROUP') {
                  // Nếu có tên nhóm, hiển thị tên nhóm
                  if (conv.name) {
                    return conv.name;
                  }
                  
                  // Nếu không có tên nhóm, hiển thị tên các thành viên
                  const memberNames = conv.members
                    ?.filter(member => member.user.id !== currentUser?.id)
                    ?.map(member => member.user.fullName || member.user.username)
                    ?.slice(0, 3) || []; // Chỉ lấy tối đa 3 người
                  
                  if (memberNames.length === 0) {
                    return 'Nhóm chat';
                  } else if (memberNames.length <= 2) {
                    return memberNames.join(', ');
                  } else {
                    return `${memberNames.slice(0, 2).join(', ')} và ${memberNames.length - 2} người khác`;
                  }
                } else {
                  // DIRECT conversation
                  return otherMember?.user?.fullName || otherMember?.user?.username || 'Người dùng';
                }
              };
              
              const conversationName = getConversationName();
              
              return (
                <div
                  key={conv.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-gray-100"
                      : unreadCount > 0
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    onSelectConversation(conv);
                  }}
                >
                  {/* Avatar */}
                  <div className="relative">
                      {conv.type === 'GROUP' ? (
                        // Group avatar - hiển thị avatar của 3 thành viên thành hình tam giác
                        <div className="w-12 h-12 relative">
                          {conv.members
                            ?.slice(0, 3)
                            ?.map((member, index) => {
                              const positions = [
                                'absolute top-0 left-1/2 transform -translate-x-1/2 z-1', // Avatar 1: trên cùng, giữa
                                'absolute bottom-0 left-0 z-10', // Avatar 2: dưới trái, đè lên avatar 1
                                'absolute bottom-0 right-0 z-20'  // Avatar 3: dưới phải, đè lên avatar 1
                              ];
                              
                              return (
                                <div
                                  key={member.user.id}
                                  className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md ${positions[index]}`}
                                >
                                  <img
                                    src={member.user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                                    alt={member.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              );
                            })}
                          
                        </div>
                    ) : (
                      // Direct chat avatar
                      <img
                        src={otherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                        alt={otherMember?.user?.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    
                    {/* Online status indicator - chỉ hiển thị cho direct chat và khi showOnlineStatus = true */}
                    {conv.type === 'DIRECT' && 
                     onlineUsers[otherMember?.user?.id] && 
                     otherMember?.user?.privacySettings?.showOnlineStatus !== false && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    
                    {/* Unread count */}
                    {unreadCount > 0 && selectedConversation?.id !== conv.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9' : unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${
                        unreadCount > 0 && selectedConversation?.id !== conv.id ? "text-gray-900 font-bold" : "text-gray-900"
                      }`} title={conversationName}>
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
                        <span className=" text-gray-500">đang nhập...</span>
                      ) : lastMessage ? (
                        (() => {
                          const isOwn = lastMessage.senderId === currentUser?.id
                          const isGroup = conv.type === 'GROUP'
                          const prefix = lastMessage.isSystem
                            ? ''
                            : isOwn
                              ? 'Bạn: '
                              : isGroup
                                ? `${lastMessage.sender?.fullName || lastMessage.sender?.username || 'Hệ thống'}: `
                                : ''
                          let body = ''
                          if (lastMessage.isRecalled) body = 'Tin nhắn đã thu hồi'
                          else if (lastMessage.type === 'IMAGE') body = 'đã gửi một ảnh'
                          else if (lastMessage.type === 'VIDEO') body = 'đã gửi một video'
                          else body = lastMessage.content || ''
                          return (
                            <span className={unreadCount > 0 && selectedConversation?.id !== conv.id ? 'font-semibold text-gray-900' : ''}>
                              {prefix}{body}
                            </span>
                          )
                        })()
                      ) : (
                        'Bắt đầu cuộc trò chuyện'
                      )}
                    </p>
                    
                    {/* Online/Offline status - chỉ hiển thị cho DIRECT chat và khi showOnlineStatus = true */}
                    {conv.type === 'DIRECT' && otherMember?.user?.privacySettings?.showOnlineStatus !== false && (
                      <p className="text-xs text-gray-400 truncate">
                        {onlineUsers[otherMember?.user?.id] ? (
                          <span className="text-green-500">Đang hoạt động</span>
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
        onGroupCreated={(conversation) => {
          // Chọn conversation mới được tạo
          onSelectConversation(conversation);
          // Refresh danh sách conversations
          refetch();
        }}
      />
    </div>
  );
};

export default ChatSidebar;
