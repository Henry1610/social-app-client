import React, { useEffect, useState, useRef, useMemo } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetPublicProfileQuery } from "../profile/profileApi";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetConversationQuery,
  useGetConversationMembersQuery,
  useMarkConversationAsReadMutation,
  chatApi,
} from "./chatApi";
import { useChat } from "../../contexts/ChatContext";
import { useSelector } from "react-redux";
import socketService from "../../services/socket";

const ChatMain = ({ onStartNewMessage }) => {
  const { selectedConversation, setSelectedConversation } = useChat();
  const { username, conversationId } = useParams();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
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

  // Send message mutation
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markConversationAsRead] = useMarkConversationAsReadMutation();

  // Mark conversation as read when user enters
  useEffect(() => {
    if (selectedConversation?.id) {
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, markConversationAsRead]);

  // Socket event handlers
  useEffect(() => {
    if (!selectedConversation?.id) return;

    // Join conversation room
    socketService.joinConversation(selectedConversation.id);

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === selectedConversation.id) {
        // Đánh dấu các cache này đã lỗi thời 
        chatApi.util.invalidateTags(["Message"]);
        chatApi.util.invalidateTags(["Conversation"]);
        chatApi.util.invalidateTags([
          { type: "Message", id: selectedConversation.id },
        ]);

        // Gọi lại endpoint ngay lập tức
        refetch();

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
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

    // Listen for user status updates
    const handleUserStatus = (data) => {
      // Handle online/offline status updates
    };

    socketService.on("chat:new_message", handleNewMessage);
    socketService.on("chat:user_typing", handleTyping);
    socketService.on("chat:user_status", handleUserStatus);

    return () => {
      socketService.off("chat:new_message", handleNewMessage);
      socketService.off("chat:user_typing", handleTyping);
      socketService.off("chat:user_status", handleUserStatus);
      socketService.leaveConversation(selectedConversation.id);
    };
  }, [selectedConversation?.id, currentUserId]);

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
      //Gọi API gửi tin nhắn
      await sendMessage({
        conversationId: selectedConversation.id,
        content: messageContent,
        type: "TEXT",
      }).unwrap();

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
                      const showTime =
                        index === messages.length - 1 ||
                        new Date(msg.createdAt).getTime() -
                          new Date(messages[index + 1]?.createdAt).getTime() >
                          300000; // 5 minutes

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
                            } group`}
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
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {msg.content}
                                </p>
                              </div>
                              {/* Timestamp - Outside message bubble */}
                              {/* {showTime && (
                              <div className={`text-xs mt-1 text-red${
                                isOwnMessage ? 'text-right' : 'text-left'
                              }`}>
                                <span className={`px-2 py-4 rounded ${
                                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  })}
                                </span>
                              </div>
                            )} */}

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
            disabled={!message.trim() || !selectedConversation || isSending}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
