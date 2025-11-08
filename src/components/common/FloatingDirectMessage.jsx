import { useState, useMemo, useEffect, useRef } from "react";
import { Maximize, X, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetConversationsQuery, useGetMessagesQuery, useUploadChatMediaMutation } from "../../features/chat/chatApi";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import socketService from "../../services/socket";
import MessageItem from "../../features/chat/components/MessageItem";
import MessageInput from "../../features/chat/components/MessageInput";
import EditHistoryModal from "../../features/chat/components/EditHistoryModal";
import { useGetMessageEditHistoryQuery } from "../../features/chat/chatApi";
const FloatingDirectMessage = ({ avatarUrl, label = "Tin nhắn", onSelectConversation }) => {
  const [open, setOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [showEditHistory, setShowEditHistory] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = useSelector(selectCurrentUser);
  const { data: conversationsData, isLoading } = useGetConversationsQuery();
  
  // Load messages khi có conversation được chọn
  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessagesQuery(
    { conversationId: selectedConv?.id },
    { skip: !selectedConv?.id }
  );
  const { data: editHistoryData } = useGetMessageEditHistoryQuery(
    showEditHistory,
    { skip: !showEditHistory }
  );
  const [uploadChatMedia] = useUploadChatMediaMutation();
  
  const messages = useMemo(() => messagesData?.data?.messages || [], [messagesData?.data?.messages]);
  
  // Scroll to bottom khi có messages mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.conversations) return [];
    
    return conversationsData.data.conversations.map(conv => {
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
      
      return {
        id: conv.id,
        name: getConversationName(),
        message: getMessagePreview(),
        time: getTime(),
        avatar: getAvatar(),
        conversation: conv
      };
    });
  }, [conversationsData?.data?.conversations, currentUser?.id]);

  // Handle send message
  const handleSendMessage = async () => {
    if ((!message.trim() && selectedMedia.length === 0) || !selectedConv?.id) return;
    
    const messageContent = message.trim();
    const mediaToSend = selectedMedia;
    
    setMessage("");
    setSelectedMedia([]);

    try {
      if (mediaToSend.length > 0) {
        const files = mediaToSend.map(m => m.file);
        const res = await uploadChatMedia({ conversationId: selectedConv.id, files }).unwrap();
        const uploaded = res?.data?.files || [];
        uploaded.forEach((u, idx) => {
          socketService.socket.emit("chat:send_message", {
            conversationId: selectedConv.id,
            content: idx === 0 ? messageContent : null,
            type: u.type,
            mediaUrl: u.url,
            mediaType: u.mediaType,
            replyToId: null,
          });
        });
      } else {
        socketService.socket.emit("chat:send_message", {
          conversationId: selectedConv.id,
          content: messageContent,
          type: "TEXT",
          replyToId: null,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageContent);
      setSelectedMedia(mediaToSend);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (selectedConv?.id) {
      socketService.setTyping(selectedConv.id, true);
      setTimeout(() => {
        socketService.setTyping(selectedConv.id, false);
      }, 1000);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  // Check if message is last in conversation
  const isLastMessageInConversation = (message) => {
    if (!messages || messages.length === 0) {
      return false;
    }
    return messages[messages.length - 1]?.id === message?.id;
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      {/* Nút mở khung chat */}
      <button
        onClick={() => setOpen(true)}
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
        <div className="fixed bottom-4 right-4 left-4 top-auto w-auto h-[70vh] max-h-[500px] bg-white rounded-xl shadow-2xl flex flex-col sm:bottom-10 sm:right-10 sm:left-auto sm:w-[320px] sm:h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between p-2.5 border-b">
            {selectedConv ? (
              <>
                <button
                  onClick={() => setSelectedConv(null)}
                  className="p-1 rounded-full hover:bg-gray-100 mr-1.5"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h2 className="text-base font-semibold flex-1 truncate">{getSelectedConvName()}</h2>
              </>
            ) : (
            <h2 className="text-base font-semibold">Tin nhắn</h2>
            )}
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-full hover:bg-gray-100">
                <Maximize className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setSelectedConv(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {selectedConv ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
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
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.senderId === currentUser?.id;
                      const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                      
                      return (
                        <div key={msg.id} className={`scale-75 ${isOwnMessage ? 'origin-right' : 'origin-left'}`}>
                          <MessageItem
                            message={msg}
                            isOwnMessage={isOwnMessage}
                            showAvatar={showAvatar}
                            currentUserId={currentUser?.id}
                            isLastMessageInConversation={isLastMessageInConversation}
                            canEditMessage={() => false}
                            onMenuAction={() => {}}
                            onShowEditHistory={(messageId) => setShowEditHistory(messageId)}
                            onMessageMenuClick={() => {}}
                            showMessageMenu={null}
                            editingMessage={null}
                            editContent=""
                            setEditContent={() => {}}
                            onSaveEdit={() => {}}
                            onCancelEdit={() => {}}
                            onEditKeyPress={() => {}}
                            isEditing={false}
                            getMessageStatusIcon={() => null}
                            onScrollToMessage={() => {}}
                            onRecallMessage={() => {}}
                            onPinMessage={() => {}}
                            editHistoryData={showEditHistory === msg.id ? editHistoryData : null}
                          />
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    Chưa có tin nhắn nào
                  </div>
                )}
              </div>

              {/* Message Input */}
              <MessageInput
                message={message}
                setMessage={setMessage}
                onTyping={handleTyping}
                onKeyPress={handleKeyPress}
                onSendMessage={handleSendMessage}
                replyingTo={null}
                selectedConversation={selectedConv}
                selectedMedia={selectedMedia}
                onMediaSelect={setSelectedMedia}
                canMessage={{ allowed: true }}
              />
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
                        setSelectedConv(msg.conversation);
                        if (onSelectConversation) {
                          onSelectConversation(msg.conversation);
                        }
                      }
                    }}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={msg.avatar}
                    alt={msg.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-xs">{msg.name}</p>
                        <p className="text-[10px] text-gray-500 truncate w-[160px]">
                      {msg.message}
                    </p>
                  </div>
                </div>
                    {msg.time && (
                <p className="text-[10px] text-gray-400">{msg.time}</p>
                    )}
              </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit History Modal */}
      <EditHistoryModal
        showEditHistory={showEditHistory}
        onClose={() => setShowEditHistory(null)}
        editHistoryData={editHistoryData}
      />
    </div>
  );
};

export default FloatingDirectMessage;
