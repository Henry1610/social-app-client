import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Edit,
  Forward,
  Copy,
  Undo,
  Check,
  CheckCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetPublicProfileQuery } from "../profile/profileApi";
import {
  useGetMessagesQuery,
  useEditMessageMutation,
  useGetMessageEditHistoryQuery,
  useGetConversationQuery,
  useGetConversationMembersQuery,
  chatApi,
} from "./chatApi";
import { useChat } from "../../contexts/ChatContext";
import { useSelector } from "react-redux";
import socketService from "../../services/socket";

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  const [editMessage, { isLoading: isEditing }] = useEditMessageMutation();

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

    socketService.on("chat:new_message", handleNewMessage);
    socketService.on("chat:user_typing", handleTyping);
    socketService.on("message:status_update", handleMessageStatusUpdate);

    return () => {
      socketService.off("chat:new_message", handleNewMessage);
      socketService.off("chat:user_typing", handleTyping);
      socketService.off("message:status_update", handleMessageStatusUpdate);
      socketService.leaveConversation(selectedConversation.id);
    };
  }, [selectedConversation?.id, currentUserId, refetch]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    try {
      // Gửi tin nhắn qua socket thay vì API
      socketService.socket.emit("chat:send_message", {
        conversationId: selectedConversation.id,
        content: messageContent,
        type: "TEXT",
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

    try {
      await editMessage({
        messageId: editingMessage,
        content: editContent.trim(),
      }).unwrap();

      // Invalidate cache để cập nhật tin nhắn ngay lập tức
      chatApi.util.invalidateTags(["Message"]);
      chatApi.util.invalidateTags([
        { type: "Message", id: selectedConversation?.id },
      ]);

      // Refetch messages để đảm bảo có data mới nhất
      refetch();

      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error("Error editing message:", error);
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

  // Check if message can be edited (within 10 minutes)
  const canEditMessage = (message) => {
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
                      // const showTime =
                      //   index === messages.length - 1 ||
                      //   new Date(msg.createdAt).getTime() -
                      //     new Date(messages[index + 1]?.createdAt).getTime() >
                      //     300000; // 5 minutes

                      // Check if we need to show date separator
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
                        <div key={msg.id}>
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

                          <div
                            className={`flex ${
                              isOwnMessage
                                ? "justify-end mr-4"
                                : "justify-start"
                            } group relative`}
                          >
                            <div
                              className={`flex max-w-xs lg:max-w-md ${
                                isOwnMessage ? "flex-row-reverse" : "flex-row"
                              } items-end space-x-2`}
                            >
                              {/* Avatar */}
                              {!isOwnMessage && showAvatar && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {msg.sender?.avatarUrl ? (
                                    <img
                                      src={msg.sender.avatarUrl}
                                      alt={msg.sender.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">
                                        {msg.sender?.fullName
                                          ?.charAt(0)
                                          ?.toUpperCase() ||
                                          msg.sender?.username
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Spacer cho tin nhắn không có avatar */}
                              {!isOwnMessage && !showAvatar && (
                                <div className="w-8 h-8"></div>
                              )}

                              {/* Message bubble */}
                              <div
                                className={`relative px-5 py-2 rounded-2xl ${
                                  isOwnMessage
                                    ? "bg-primary-btn text-white rounded-br-md"
                                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                                } group/message`}
                              >
                                {editingMessage === msg.id ? (
                                  // Edit mode
                                  <div className="space-y-2">
                                    <textarea
                                      value={editContent}
                                      onChange={(e) =>
                                        setEditContent(e.target.value)
                                      }
                                      onKeyDown={handleEditKeyPress}
                                      className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none"
                                      rows={Math.max(
                                        1,
                                        editContent.split("\n").length
                                      )}
                                      autoFocus
                                    />
                                    <div className="flex gap-2 text-xs">
                                      <button
                                        onClick={handleSaveEdit}
                                        disabled={
                                          isEditing || !editContent.trim()
                                        }
                                        className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-50"
                                      >
                                        Lưu
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-2 py-1 bg-white/20 rounded hover:bg-white/30"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Normal mode
                                  <p className="text-sm leading-relaxed flex items-center  flex-col">
                                    {msg.content}
                                    {msg.updatedAt &&
                                      msg.updatedAt !== msg.createdAt && (
                                        <span
                                          onClick={() =>
                                            handleShowEditHistory(msg.id)
                                          }
                                          className={`text-[11px] italic cursor-pointer hover:underline ${
                                            isOwnMessage
                                              ? "text-white/70"
                                              : "text-gray-400"
                                          }`}
                                          title="Đã chỉnh sửa"
                                        >
                                          (đã chỉnh sửa)
                                        </span>
                                      )}
                                  </p>
                                )}

                                {/* Hover menu button */}
                                <button
                                  onClick={(e) => {
                                    handleMessageMenuClick(msg.id, e);
                                    // Nếu là tin nhắn của người khác, đánh dấu đã đọc
                                    // if (!isOwnMessage) {
                                    //   socketService.socket.emit(
                                    //     "message:seen",
                                    //     {
                                    //       conversationId:
                                    //         selectedConversation.id,
                                    //       userId: currentUserId,
                                    //     }
                                    //   );
                                    //   chatApi.util.invalidateTags([
                                    //     "Conversation",
                                    //   ]);
                                    // }
                                  }}
                                  className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-black/10"
                                  style={{
                                    [isOwnMessage ? "left" : "right"]: "-30px",
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Context Menu */}
                                {showMessageMenu === msg.id && (
                                  <div
                                    className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
                                    style={{
                                      bottom: "100%",
                                      marginBottom: "8px",
                                      [isOwnMessage ? "left" : "right"]:
                                        "-160px",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Time header */}
                                    <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100">
                                      {new Date(
                                        msg.createdAt
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        weekday: "short",
                                      })}
                                    </div>

                                    {/* Menu items */}
                                    {canEditMessage(msg) && (
                                      <button
                                        onClick={() =>
                                          handleMenuAction("edit", msg.id)
                                        }
                                        className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                                      >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                        Chỉnh sửa
                                      </button>
                                    )}

                                    <button
                                      onClick={() =>
                                        handleMenuAction("forward", msg.id)
                                      }
                                      className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                                    >
                                      <Forward className="w-4 h-4 text-gray-600" />
                                      Chuyển tiếp
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleMenuAction("copy", msg.id)
                                      }
                                      className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                                    >
                                      <Copy className="w-4 h-4 text-gray-600" />
                                      Sao chép
                                    </button>

                                    {/* Separator */}
                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                      onClick={() =>
                                        handleMenuAction("recall", msg.id)
                                      }
                                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3"
                                    >
                                      <Undo className="w-4 h-4 text-red-500" />
                                      Thu hồi
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Edit indicator icon - hiển thị cho cả tin nhắn của người đối phương
                              {msg.updatedAt && msg.updatedAt !== msg.createdAt && (
                                <button
                                  onClick={() => handleShowEditHistory(msg.id)}
                                  className={`absolute p-1 bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm transition-colors ${
                                    isOwnMessage ? "-bottom-1 -right-1" : "-bottom-1 right-10"
                                  }`}
                                  title="Đã chỉnh sửa"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )} */}

                              {/* Message status icon - chỉ hiển thị khi tin nhắn cuối cùng là của mình */}
                              {isOwnMessage &&
                                !(
                                  msg.updatedAt &&
                                  msg.updatedAt !== msg.createdAt
                                ) &&
                                isLastMessageInConversation(msg) && (
                                  <div className="absolute -bottom-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
                                    {getMessageStatusIcon(msg)}
                                  </div>
                                )}

                              {/* Spacer for alignment */}
                              {isOwnMessage && showAvatar && (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                          </div>
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

      {/* Message Input */}
      <div className="p-4  border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          {/* Attachment button */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative border rounded-full">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              className="w-full py-2 px-4 pr-12 rounded-full  text-gray-900  focus:outline-none focus:bg-white transition-colors"
              disabled={!selectedConversation}
            />

            {/* Emoji button */}
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-full text-white transition-colors ${
              message.trim() && selectedConversation
                ? "bg-primary-btn hover:bg-primary-btn-hover"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!message.trim() || !selectedConversation}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Edit History Modal */}
      {showEditHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử chỉnh sửa
                </h3>
                <button
                  onClick={() => setShowEditHistory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {editHistoryData?.data?.editHistory ? (
                <div className="space-y-3">
                  {editHistoryData.data.editHistory.map((edit, index) => (
                    <div
                      key={edit.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              edit.editor.avatarUrl ||
                              "/images/avatar-IG-mac-dinh-1.jpg"
                            }
                            alt={edit.editor.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">
                            {edit.editor.fullName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(edit.editedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500">Từ:</span>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {edit.oldContent}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Thành:</span>
                          <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                            {edit.newContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Không có lịch sử chỉnh sửa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMain;
