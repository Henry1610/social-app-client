import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { Check, CheckCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetPublicProfileQuery } from "../profile/profileApi";
import {
  useGetMessagesQuery,
  useGetMessageEditHistoryQuery,
  useGetConversationQuery,
  useGetConversationMembersQuery,
  chatApi,
} from "./chatApi";
import { useChat } from "../../contexts/ChatContext";
import { useSelector } from "react-redux";
import socketService from "../../services/socket";
import MessageItem from "./components/MessageItem";
import ReplyPreview from "./components/ReplyPreview";
import MessageInput from "./components/MessageInput";
import EditHistoryModal from "./components/EditHistoryModal";

const ChatMain = ({ onStartNewMessage }) => {
  const { selectedConversation, setSelectedConversation } = useChat();
  const { username, conversationId } = useParams();
  const [message, setMessage] = useState("");
  const [, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEditHistory, setShowEditHistory] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});

  // Phân biệt giữa username và conversationId
  const isConversationId = conversationId && !isNaN(conversationId);
  const isUsername = username && isNaN(username);

  // Lấy thông tin user từ API (chỉ khi có username thật)
  const { data: userInfo, isLoading } = useGetPublicProfileQuery(username, {
    skip: !isUsername,
  });

  // Load conversation nếu có conversationId
  const { data: conversationData, isLoading: isLoadingConversation } =
    useGetConversationQuery(conversationId, { skip: !isConversationId });

  // Load conversation members nếu có conversationId
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetConversationMembersQuery(conversationId, { skip: !isConversationId });

  // Lấy current user từ Redux store
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id;

  // Set selectedConversation khi có conversationId
  useEffect(() => {
    if (conversationData?.data?.conversation && membersData?.data?.members) {
      const conversation = {
        ...conversationData.data.conversation,
        members: membersData.data.members,
      };
      setSelectedConversation(conversation);
    }
  }, [conversationData, membersData, setSelectedConversation]);

  // Lấy thông tin user từ conversation data (khi dùng conversationId)
  const otherMember = selectedConversation?.members?.find(
    (member) => member.user.id !== currentUserId
  );
  const conversationUserInfo = otherMember?.user;

  // Sử dụng userInfo từ API hoặc từ conversation
  const displayUserInfo = isUsername
    ? userInfo
    : { user: conversationUserInfo };
  const displayIsLoading = isUsername
    ? isLoading
    : isLoadingConversation || isLoadingMembers;

  // Load tin nhắn nếu có selectedConversation
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch,
  } = useGetMessagesQuery(
    { conversationId: selectedConversation?.id },
    { skip: !selectedConversation?.id }
  );

 

  const messages = useMemo(() => {
    return messagesData?.data?.messages || [];
  }, [messagesData?.data?.messages]);

  const [isEditing, setIsEditing] = useState(false);

  const { data: editHistoryData } = useGetMessageEditHistoryQuery(
    showEditHistory,
    { skip: !showEditHistory }
  );

  // Đánh dấu tin nhắn là đã đọc khi chuyển vào conversation
  useEffect(() => {
    if (selectedConversation?.id) {
      // Emit message:seen để chuyển từ DELIVERED thành READ
      socketService.socket.emit('message:seen', {
        conversationId: selectedConversation.id,
        userId: currentUserId
      });

      // Invalidate conversation cache để cập nhật badge trên sidebar
      chatApi.util.invalidateTags(["Conversation"]);
    }
  }, [selectedConversation?.id, currentUserId]);

  // Socket event handlers
  useEffect(() => {
    if (!selectedConversation?.id) return;

    // Join conversation room
    socketService.joinConversation(selectedConversation.id);

    // Refetch messages ngay khi join conversation để đảm bảo có tin nhắn mới nhất
    refetch();

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === selectedConversation.id) {
        // Gọi lại endpoint ngay lập tức
        refetch();

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        // Tin nhắn từ conversation khác - chỉ invalidate cache để sidebar cập nhật
        chatApi.util.invalidateTags(["Conversation"]);
      }
    };

    // Listen for typing indicators
    const handleTyping = (data) => {
      if (
        data.conversationId === selectedConversation.id &&
        data.userId !== currentUserId
      ) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((user) => user.userId !== data.userId);
          return data.isTyping
            ? [...filtered, { userId: data.userId, isTyping: true }]
            : filtered;
        });
      }
    };

    const handleMessageStatusUpdate = (data) => {
      if (data.conversationId === selectedConversation.id) {
        // Cập nhật trạng thái tin nhắn ngay lập tức
        refetch();
      }
    };

    const handleMessageEdited = (data) => {
      if (data.conversationId === selectedConversation.id) {
        refetch();
        
        chatApi.util.invalidateTags([
          { type: 'MessageEditHistory', id: data.message.id }
        ]);
      }
    };

    const handleMessageRecalled = (data) => {
      if (data.conversationId === selectedConversation.id) {
        refetch();
      }
      
    };

    const handleChatError = (data) => {
      console.error("Chat error:", data.message);
      // Có thể thêm toast notification ở đây
    };

    socketService.on("chat:new_message", handleNewMessage);
    socketService.on("chat:message_edited", handleMessageEdited);
    socketService.on("chat:message_recalled", handleMessageRecalled);
    socketService.on("chat:user_typing", handleTyping);
    socketService.on("message:status_update", handleMessageStatusUpdate);
    socketService.on("chat:error", handleChatError);

    return () => {
      socketService.off("chat:new_message", handleNewMessage);
      socketService.off("chat:message_edited", handleMessageEdited);
      socketService.off("chat:message_recalled", handleMessageRecalled);
      socketService.off("chat:user_typing", handleTyping);
      socketService.off("message:status_update", handleMessageStatusUpdate);
      socketService.off("chat:error", handleChatError);
      socketService.leaveConversation(selectedConversation.id);
    };
  }, [selectedConversation?.id, currentUserId, refetch]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to specific message
  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  };

  // Handle recall message
  const handleRecallMessage = async (messageId) => {
    try {
      socketService.recallMessage({
        messageId: messageId,
        conversationId: selectedConversation.id
      });
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedConversation?.id) return;

    setIsTyping(true);
    socketService.setTyping(selectedConversation.id, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.setTyping(selectedConversation.id, false);
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation?.id) return;

    const messageContent = message.trim();
    setMessage("");
    setReplyingTo(null); // Clear reply state

    try {
      // Gửi tin nhắn qua socket thay vì API
      socketService.socket.emit("chat:send_message", {
        conversationId: selectedConversation.id,
        content: messageContent,
        type: "TEXT",
        replyToId: replyingTo?.id || null, // Include reply reference
      });

      // Stop typing indicator
      setIsTyping(false);
      socketService.setTyping(selectedConversation.id, false);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageContent);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageMenuClick = (messageId, event) => {
    event.stopPropagation();
    setShowMessageMenu(showMessageMenu === messageId ? null : messageId);
  };

  const handleMenuAction = (action, messageId) => {
    if (action === "edit") {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        setEditingMessage(messageId);
        setEditContent(message.content);
        setShowMessageMenu(null);
      }
    } else if (action === "reply") {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        setReplyingTo(message);
        setShowMessageMenu(null);
      }
    } else if (action === "copy") {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        navigator.clipboard
          .writeText(message.content)
          .then(() => {
            // Có thể thêm toast notification ở đây
            console.log("Đã sao chép tin nhắn");
          })
          .catch((err) => {
            console.error("Lỗi khi sao chép:", err);
          });
        setShowMessageMenu(null);
      }
    } else {
      console.log(`${action} message ${messageId}`);
      setShowMessageMenu(null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMessageMenu(null);
    };

    if (showMessageMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMessageMenu]);

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    setIsEditing(true);
    try {
      // Sử dụng socket để edit message realtime
      socketService.editMessage({
        messageId: editingMessage,
        content: editContent.trim(),
      });

      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  // Handle edit key press
  const handleEditKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Handle show edit history
  const handleShowEditHistory = (messageId) => {
    setShowEditHistory(showEditHistory === messageId ? null : messageId);
  };

  // Get message status icon based on MessageState
  const getMessageStatusIcon = (message) => {
    // Mặc định hiển thị icon SENT nếu không có trạng thái
    if (!message || message.senderId !== currentUserId) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }

    // Nếu không có states hoặc không tìm thấy states của người nhận, hiển thị SENT
    if (!message.states || message.states.length === 0) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }

    // Find the recipient's message state
    const recipientState = message.states.find(
      (state) => state.userId !== currentUserId
    );
    if (!recipientState) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }

    // Get status from MessageState
    const status = recipientState.status.toLowerCase();

    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  // Kiểm tra xem tin nhắn có phải là tin nhắn cuối cùng của người dùng hiện tại trong đoạn chat không
  const isLastMessageInConversation = (message) => {
    if (!messages || messages.length === 0) {
      return false;
    }

    // Sắp xếp tin nhắn theo thời gian tạo mới nhất
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Tìm tin nhắn cuối cùng của người dùng hiện tại
    const lastMessageFromCurrentUser = sortedMessages.find(
      (msg) => msg.senderId === currentUserId
    );

    if (!lastMessageFromCurrentUser) {
      return false;
    }

    return message.id === lastMessageFromCurrentUser.id;
  };

  // Check if message can be edited (within 10 minutes and is own message)
  const canEditMessage = (message) => {
    // Chỉ cho phép chỉnh sửa tin nhắn của bản thân
    if (message.senderId !== currentUserId) {
      return false;
    }
    
    // Kiểm tra thời gian (trong vòng 10 phút)
    const messageTime = new Date(message.createdAt);
    const now = new Date();
    const diffInMinutes = (now - messageTime) / (1000 * 60);
    return diffInMinutes <= 10;
  };

  // Hiển thị loading state
  if (displayIsLoading) {
    return (
      <div className="flex flex-col h-full bg-white text-gray-900">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="space-y-[1px]">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Message Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center justify-start pt-8">
            {/* User Profile Card Skeleton */}
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar Skeleton */}
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>

                {/* User Info Skeleton */}
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>

                {/* Button Skeleton */}
                <div className="w-full">
                  <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input Skeleton */}
        <div className="p-6 border-gray-200">
          <div className="h-12 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  // Hiển thị chat interface với username
  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {displayUserInfo?.user?.avatarUrl ? (
            <img
              src={displayUserInfo.user.avatarUrl}
              alt={displayUserInfo?.user?.username || username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900">
                {(displayUserInfo?.user?.username || username)
                  ?.charAt(0)
                  ?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="space-y-[0.3px]">
            <h3 className="font-medium text-gray-900 text-md">
              {displayUserInfo?.user?.fullName}
            </h3>
            <p className="text-xs text-gray-600">
              {displayUserInfo?.user?.username}
            </p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* User Profile Card - Luôn hiển thị */}
          <div className="flex-shrink-0 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={displayUserInfo?.user?.avatarUrl}
                    alt={displayUserInfo?.user?.username || username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                  />
                </div>

                {/* User Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {displayUserInfo?.user?.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    @{displayUserInfo?.user?.username}
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Instagram
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Xem trang cá nhân
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area - Chiếm phần còn lại và sát mép dưới */}
          <div className="flex-1 flex flex-col justify-end px-4">
            {selectedConversation && (
              <div className="w-full">
                {isLoadingMessages ? (
                  // Loading skeleton cho tin nhắn
                  <div className="space-y-3 pb-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  // Hiển thị danh sách tin nhắn với UI đẹp hơn
                  <div className="space-y-1 pb-4">
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.senderId === currentUserId;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1]?.senderId !== msg.senderId;

                      const currentDate = new Date(
                        msg.createdAt
                      ).toDateString();
                      const prevDate =
                        index > 0
                          ? new Date(
                              messages[index - 1]?.createdAt
                            ).toDateString()
                          : null;
                      const showDateSeparator =
                        index === 0 || currentDate !== prevDate;

                      return (
                        <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)}>
                          {/* Date Separator */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {new Date(msg.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </div>
                          )}

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
                            getMessageStatusIcon={getMessageStatusIcon}
                            onScrollToMessage={scrollToMessage}
                            onRecallMessage={handleRecallMessage}
                          />
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="w-8 h-8"></div>

                        <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>

                          <span className="text-xs text-gray-500">
                            Đang gõ...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  // Không có tin nhắn
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <p className="text-sm">Chưa có tin nhắn nào</p>
                    <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Preview */}
      <ReplyPreview 
        replyingTo={replyingTo} 
        onCancelReply={() => setReplyingTo(null)} 
      />

      {/* Message Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        onTyping={handleTyping}
              onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        selectedConversation={selectedConversation}
      />

      {/* Edit History Modal */}
      <EditHistoryModal
        showEditHistory={showEditHistory}
        onClose={() => setShowEditHistory(null)}
        editHistoryData={editHistoryData}
      />
    </div>
  );
};

export default ChatMain;
