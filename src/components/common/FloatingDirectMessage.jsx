import { useState, useMemo, useEffect } from "react";
import { Maximize, X, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/chat/api/chatApi";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { useChat } from "../../contexts/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatLogic } from "../../features/chat/hooks/useChatLogic";
import MessageItem from "../../features/chat/components/MessageItem";
import MessageInput from "../../features/chat/components/MessageInput";
import ReplyPreview from "../../features/chat/components/ReplyPreview";
import EditHistoryModal from "../../features/chat/components/EditHistoryModal";
import TypingIndicator from "../../features/chat/components/TypingIndicator";
import DateSeparator from "../../features/chat/components/DateSeparator";
import SystemMessage from "../../features/chat/components/SystemMessage";
import EmptyMessagesState from "../../features/chat/components/EmptyMessagesState";
import ChatProfileCard from "../../features/chat/components/ChatProfileCard";
import ConversationAvatars from "./ConversationAvatars";
import PinnedMessagesBar from "../../features/chat/components/PinnedMessagesBar";
import socketService from "../../services/socket";
import { isUserActuallyOnline } from "../../utils/userStatusUtils";

const FloatingDirectMessage = ({ avatarUrl, label = "Tin nhắn", onSelectConversation }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedConversation,
    isModalOpen,
    openChat,
    closeModal,
    closeChat,
    setSelectedConversation
  } = useChat();
  
  // Sử dụng selectedConversation từ context
  const selectedConv = selectedConversation || null;
  // open state dựa vào isModalOpen từ context, hoặc local state khi user click nút mở
  const [localOpen, setLocalOpen] = useState(false);
  // Modal mở khi: isModalOpen = true (từ context) HOẶC localOpen = true (user click nút)
  const open = isModalOpen || localOpen;
  
  const currentUser = useSelector(selectCurrentUser);
  const { data: conversationsData, isLoading } = useGetConversationsQuery();
  
  // State cho online users
  const [onlineUsers, setOnlineUsers] = useState({});
  
  // Sử dụng useChatLogic khi có conversation được chọn
  const chatLogic = useChatLogic({ 
    conversationId: selectedConv?.id, 
    username: null,
    onClose: () => closeModal()
  });
  
  // Destructure từ useChatLogic
  const {
    message, setMessage, typingUsers, showMessageMenu, editingMessage, editContent, setEditContent,
    showEditHistory, replyingTo, setReplyingTo, selectedMedia, setSelectedMedia, messagesEndRef,
    isEditing, editHistoryData, displayIsLoading, messages, isLoadingMessages,
    canMessage, currentUserId, handleTyping, handleSendMessage, handleKeyPress, 
    handleMessageMenuClick, handleMenuAction, handleSaveEdit, handleCancelEdit, 
    handleEditKeyPress, handleShowEditHistory, scrollToMessage,
    handleRecallMessage, handlePinMessage, isLastMessageInConversation, 
    canEditMessage, getMessageStatusIconWrapper, displayUserInfo, conversationUserInfo, userInfo,
    selectedConversation: logicSelectedConversation, pinnedMessages, pinnedMessagesExpanded, setPinnedMessagesExpanded,
  } = chatLogic || {};
  
  // Reset localOpen khi vào /chat
  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      setLocalOpen(false);
    }
  }, [location.pathname]);

  // ===== SOCKET EVENT HANDLERS FOR ONLINE STATUS =====
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
    if (conversationsData?.data?.conversations) {
      const initialOnlineUsers = {};
      conversationsData.data.conversations.forEach(conv => {
        conv.members?.forEach(member => {
          if (member.user.id !== currentUser?.id) {
            initialOnlineUsers[member.user.id] = isUserActuallyOnline(member.user);
          }
        });
      });
      setOnlineUsers(initialOnlineUsers);
    }
  }, [conversationsData?.data?.conversations, currentUser?.id]);

  // ===== PERIODIC ONLINE STATUS UPDATE =====
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversationsData?.data?.conversations) {
        setOnlineUsers(prev => {
          const updated = { ...prev };
          conversationsData.data.conversations.forEach(conv => {
            conv.members?.forEach(member => {
              if (member.user.id !== currentUser?.id) {
                updated[member.user.id] = isUserActuallyOnline(member.user);
              }
            });
          });
          return updated;
        });
      }
    }, 60000); // Update mỗi phút

    return () => clearInterval(interval);
  }, [conversationsData?.data?.conversations, currentUser?.id]);
  
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.conversations) return [];
    
    return conversationsData.data.conversations
      .map(conv => {
        // Lấy thông tin người chat (không phải user hiện tại)
        const otherMember = conv.members?.find(member => 
          member.user.id !== currentUser?.id
        );
        const lastMessage = conv.messages?.[0];
        
        const getConversationName = () => {
          if (conv.type === 'GROUP') {
            return conv.name || '';
          } else {
            return otherMember?.user?.fullName || otherMember?.user?.username || 'Người dùng';
          }
        };
        
        // Xử lý avatar
        const getAvatar = () => {
          if (conv.type === 'GROUP') {
            const firstOtherMember = conv.members?.find(member => member.user.id !== currentUser?.id);
            return firstOtherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg";
          } else {
            return otherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg";
          }
        };
        
        // Xử lý preview message
        const getMessagePreview = () => {
          if (!lastMessage) return 'Bắt đầu cuộc trò chuyện';
          
          const isOwn = lastMessage.senderId === currentUser?.id;
          const isGroup = conv.type === 'GROUP';
          
          // Prefix cho message
          const prefix = lastMessage.isSystem
            ? ''
            : isOwn
              ? 'Bạn: '
              : isGroup
                ? `${lastMessage.sender?.fullName || lastMessage.sender?.username || 'Hệ thống'}: `
                : '';
          
          // Body của message
          let body = '';
          if (lastMessage.isRecalled) {
            body = 'Tin nhắn đã thu hồi';
          } else if (lastMessage.type === 'IMAGE') {
            body = 'đã gửi một ảnh';
          } else if (lastMessage.type === 'VIDEO') {
            body = 'đã gửi một video';
          } else {
            body = lastMessage.content || '';
          }
          
          return prefix + body;
        };
        
        // Format thời gian
        const getTime = () => {
          if (!lastMessage?.createdAt) return '';
          return formatTimeAgo(lastMessage.createdAt);
        };
        
        // Kiểm tra online status
        const isDirectChat = conv.type === 'DIRECT';
        const showOnlineStatus = isDirectChat && otherMember?.user?.privacySettings?.showOnlineStatus !== false;
        // Ưu tiên dùng onlineUsers state (từ socket), nếu không có thì dùng dữ liệu từ API
        const isUserOnline = onlineUsers[otherMember?.user?.id] ?? (otherMember?.user ? isUserActuallyOnline(otherMember.user) : false);
        
        return {
          id: conv.id,
          name: getConversationName(),
          message: getMessagePreview(),
          time: getTime(),
          avatar: getAvatar(),
          conversation: conv,
          otherMember,
          isDirectChat,
          showOnlineStatus,
          isUserOnline
        };
      });
  }, [conversationsData?.data?.conversations, currentUser?.id, onlineUsers]);

  // Get conversation name for selected conversation
  const getSelectedConvName = () => {
    if (!selectedConv) return "";
    if (selectedConv.type === 'GROUP') {
      return selectedConv.name || '';
    } else {
      const otherMember = selectedConv.members?.find(member => 
        member.user.id !== currentUser?.id
      );
      return otherMember?.user?.fullName || otherMember?.user?.username || 'Người dùng';
    }
  };

  // Ẩn component nếu đang ở trang /chat hoặc trên mobile (đã có bottom nav)
  if (location.pathname.startsWith('/chat')) {
    return null;
  }

  return (
    <div className="hidden md:block fixed bottom-10 right-10 z-50">
      {/* Nút mở khung chat */}
      <button
        onClick={() => {
          // Nếu đang mở thì đóng, nếu đang đóng thì mở
          if (open) {
            // Đóng modal: clear cả localOpen và context modal
            setLocalOpen(false);
            if (isModalOpen) {
              closeChat(); // Đóng hoàn toàn (clear cả conversation)
            }
          } else {
            // Mở modal với localOpen
            setLocalOpen(true);
          }
        }}
        className="flex items-center justify-between w-64 px-6 py-4 bg-white border border-gray-100 shadow-xl rounded-full hover:shadow-2xl transition-all duration-200 focus:outline-none"
      >
        {/* Icon + Label */}
        <div className="flex items-center gap-2">
          <svg
            aria-label="Tin nhắn trực tiếp"
            fill="currentColor"
            height={24}
            width={24}
            viewBox="0 0 24 24"
            className="text-gray-800"
          >
            <path
              d="M12.003 2.001a9.705 9.705 0 1 1 0 19.4 10.876 10.876 0 0 1-2.895-.384.798.798 0 0 0-.533.04l-1.984.876a.801.801 0 0 1-1.123-.708l-.054-1.78a.806.806 0 0 0-.27-.569 9.49 9.49 0 0 1-3.14-7.175 9.65 9.65 0 0 1 10-9.7Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.739"
            />
            <path
              d="M17.79 10.132a.659.659 0 0 0-.962-.873l-2.556 2.05a.63.63 0 0 1-.758.002L11.06 9.47a1.576 1.576 0 0 0-2.277.42l-2.567 3.98a.659.659 0 0 0 .961.875l2.556-2.049a.63.63 0 0 1 .759-.002l2.452 1.84a1.576 1.576 0 0 0 2.278-.42Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-gray-800 font-semibold text-sm">{label}</span>
        </div>

        {/* Avatar */}
        <img
          src={avatarUrl}
          alt="Avatar người dùng"
          className="w-6 h-6 rounded-full object-cover"
        />
      </button>

      {/* Khung tin nhắn */}
        {open && (
          <div className="fixed bottom-10 right-10 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-2.5 border-b">
            {selectedConv ? (
              <>
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 mr-1.5"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Avatar */}
                  {selectedConv.type === 'GROUP' ? (
                    <ConversationAvatars members={selectedConv.members} size={32} borderWidth={1} />
                  ) : (
                    (() => {
                      const otherMember = selectedConv.members?.find(member => 
                        member.user.id !== currentUser?.id
                      );
                      const isDirectChat = selectedConv.type === 'DIRECT';
                      const showOnlineStatus = isDirectChat && otherMember?.user?.privacySettings?.showOnlineStatus !== false;
                      const isUserOnline = onlineUsers[otherMember?.user?.id] ?? (otherMember?.user ? isUserActuallyOnline(otherMember.user) : false);
                      return (
                        <div className="relative">
                          <img
                            src={otherMember?.user?.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                            alt={otherMember?.user?.username}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          {/* Online status indicator */}
                          {isDirectChat && isUserOnline && showOnlineStatus && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                      );
                    })()
                  )}
                  <h2 className="text-base font-semibold flex-1 truncate">{getSelectedConvName()}</h2>
                </div>
              </>
            ) : (
            <h2 className="text-base font-semibold mx-2">Tin nhắn</h2>
            )}
            <div className="flex items-center gap-1.5">
              {selectedConv && (
                <button 
                  onClick={() => {
                    // Navigate đến /chat với conversation đang chọn
                    navigate(`/chat/${selectedConv.id}`);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                  title="Mở trong trang chat"
                >
                  <Maximize className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => {
                  setLocalOpen(false);
                  closeChat();
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {selectedConv && chatLogic ? (
            <>
              {/* Loading state */}
              {displayIsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-sm text-gray-500">Đang tải...</div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {/* Pinned Messages Bar - Hiển thị trên cùng */}
                    {selectedConv && pinnedMessages && (
                      <PinnedMessagesBar
                        pinnedMessages={pinnedMessages}
                        isExpanded={pinnedMessagesExpanded}
                        onToggle={() => setPinnedMessagesExpanded && setPinnedMessagesExpanded(!pinnedMessagesExpanded)}
                        onMessageClick={scrollToMessage}
                      />
                    )}
                    
                    {/* User Profile Card - Compact version for modal */}
                    <div className="px-2 pt-2 pb-1">
                      <ChatProfileCard
                        userInfo={displayUserInfo?.user || conversationUserInfo || userInfo}
                        conversationType={(logicSelectedConversation || selectedConv)?.type}
                        members={(logicSelectedConversation || selectedConv)?.members || []}
                        conversationName={(logicSelectedConversation || selectedConv)?.name || ''}
                        onViewProfile={() => {
                          const targetUsername = conversationUserInfo?.username || userInfo?.username || displayUserInfo?.user?.username;
                          if (targetUsername) {
                            navigate(`/${targetUsername}`);
                          }
                        }}
                        onViewMembers={() => {}}
                        compact={true}
                      />
                    </div>
                    
                    {/* Messages List */}
                    <div className="p-2 space-y-0.5" style={{ fontSize: '0.875rem' }}>
                      {isLoadingMessages ? (
                        <div className="space-y-1.5">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex space-x-1.5">
                              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-12 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-8 w-36 bg-gray-200 animate-pulse rounded-lg"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : messages && messages.length > 0 ? (
                        <>
                          {messages.map((msg, index) => {
                          const isOwnMessage = msg.senderId === currentUserId;
                          const prevMessage = index > 0 ? messages[index - 1] : null;
                          const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId;
                          const showDateSeparator = index === 0 || 
                            new Date(msg.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
                          
                          return (
                            <div key={msg.id}>
                              {/* Date Separator */}
                              {showDateSeparator && (
                                <div className="py-1">
                                  <DateSeparator date={msg.createdAt} />
                                </div>
                              )}
                              
                              {/* System Message */}
                              {msg.isSystem ? (
                                <SystemMessage content={msg.content} />
                              ) : (
                                <MessageItem
                                  message={msg}
                                  isOwnMessage={isOwnMessage}
                                  showAvatar={showAvatar}
                                  currentUserId={currentUserId}
                                  isLastMessageInConversation={isLastMessageInConversation}
                                  canEditMessage={canEditMessage}
                                  onMenuAction={handleMenuAction}
                                  onShowEditHistory={handleShowEditHistory}
                                  onMessageMenuClick={handleMessageMenuClick}
                                  showMessageMenu={showMessageMenu}
                                  editingMessage={editingMessage}
                                  editContent={editContent}
                                  setEditContent={setEditContent}
                                  onSaveEdit={handleSaveEdit}
                                  onCancelEdit={handleCancelEdit}
                                  onEditKeyPress={handleEditKeyPress}
                                  isEditing={isEditing}
                                  getMessageStatusIcon={getMessageStatusIconWrapper}
                                  onScrollToMessage={scrollToMessage}
                                  onRecallMessage={handleRecallMessage}
                                  onPinMessage={handlePinMessage}
                                  editHistoryData={showEditHistory === msg.id ? editHistoryData : null}
                                  compact={true}
                                />
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Typing indicator */}
                        <TypingIndicator typingUsers={typingUsers} />
                        
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <EmptyMessagesState />
                    )}
                    </div>
                  </div>

                  {/* Reply Preview */}
                  {replyingTo && (
                    <ReplyPreview 
                      replyingTo={replyingTo} 
                      onCancelReply={() => setReplyingTo(null)} 
                    />
                  )}

                  {/* Message Input - Dính sát dưới */}
                  <MessageInput
                    message={message}
                    setMessage={setMessage}
                    onTyping={handleTyping}
                    onKeyPress={handleKeyPress}
                    onSendMessage={handleSendMessage}
                    replyingTo={replyingTo}
                    selectedConversation={selectedConv}
                    selectedMedia={selectedMedia}
                    onMediaSelect={setSelectedMedia}
                    canMessage={canMessage}
                    compact={true}
                  />
                </div>
              )}
            </>
            
          ) : (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {isLoading ? (
                <div className="space-y-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 p-1.5">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-2.5 w-28 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                conversations.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (msg.conversation) {
                        const conversation = msg.conversation;
                        // Mở chat với conversation
                        openChat({ 
                          conversationId: conversation.id, 
                          conversation: conversation 
                        });
                        setLocalOpen(true);
                        
                        if (onSelectConversation) {
                          onSelectConversation(conversation);
                        }
                      }
                    }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  {msg.conversation?.type === 'GROUP' ? (
                    <ConversationAvatars members={msg.conversation.members} size={40} borderWidth={1} />
                  ) : (
                    <div className="relative">
                      <img
                        src={msg.avatar}
                        alt={msg.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {/* Online status indicator */}
                      {msg.isDirectChat && msg.isUserOnline && msg.showOnlineStatus && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{msg.name}</p>
                        <p className="text-xs text-gray-500 truncate w-[180px]">
                      {msg.message}
                    </p>
                  </div>
                </div>
                    {msg.time && (
                <p className="text-xs text-gray-400">{msg.time}</p>
                    )}
              </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit History Modal */}
      {chatLogic && (
        <EditHistoryModal
          showEditHistory={showEditHistory}
          onClose={() => handleShowEditHistory && handleShowEditHistory(null)}
          editHistoryData={editHistoryData}
        />
      )}
    </div>
  );
};

export default FloatingDirectMessage;
