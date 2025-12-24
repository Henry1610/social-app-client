import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPublicProfileQuery } from "../../profile/api/profileApi.js";
import useCanMessage from "../../../hooks/useCanMessage";
import {
  useGetMessagesQuery,
  useGetMessageEditHistoryQuery,
  useGetConversationQuery,
  useGetConversationMembersQuery,
  chatApi,
  useUploadChatMediaMutation,
  useTogglePinMessageMutation,
} from "../api/chatApi";
import { useChat } from "../../../contexts/ChatContext";
import { useSelector, useDispatch } from "react-redux";
import socketService from "../../../services/socket";
import { toast } from "sonner";
import confirmToast from "../../../components/common/confirmToast";
import { getMessageStatusIcon } from "../../../utils/getMessageStatusIcon";
import { reactionApi } from "../../reaction/api/reactionApi";

/**
 * Custom hook chứa tất cả logic của chat
 * @param {Object} props
 * @param {string} props.conversationId - ID của conversation (từ URL hoặc props)
 * @param {string} props.username - Username (từ URL hoặc props)
 * @param {Function} props.onClose - Callback khi đóng (optional, dùng cho modal)
 */
export const useChatLogic = ({ conversationId: propConversationId, username: propUsername, onClose }) => {
  const dispatch = useDispatch();
  const { selectedConversation, setSelectedConversation } = useChat();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEditHistory, setShowEditHistory] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});
  const [didInitialScroll, setDidInitialScroll] = useState(false);
  const conversationIdRef = useRef(null); // Track conversationId đã refetch chưa

  // Phân biệt giữa username và conversationId
  const conversationId = propConversationId;
  const username = propUsername;
  const isConversationId = conversationId && !isNaN(conversationId);
  const isUsername = username && isNaN(username);

  // Lấy thông tin user từ API (chỉ khi có username thật)
  const { data: userInfo, isLoading } = useGetPublicProfileQuery(username, {
    skip: !isUsername,
  });

  // Load conversation nếu có conversationId
  const { data: conversationData, isLoading: isLoadingConversation, refetch: refetchConversation } =
    useGetConversationQuery(conversationId, { skip: !isConversationId });

  // Load conversation members nếu có conversationId
  const { data: membersData, isLoading: isLoadingMembers, refetch: refetchMembers } =
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

  // Get the target user (the one we're chatting with)
  const targetUser = displayUserInfo?.user || conversationUserInfo;

  // Check if can message using hook
  const canMessage = useCanMessage({
    selectedConversation,
    targetUser,
    messages,
    isLoading: displayIsLoading,
    isUsername,
  });

  const pinnedMessages = useMemo(() => {
    return messages.filter(msg => msg.pinnedIn && msg.pinnedIn.length > 0)
      .sort((a, b) => {
        const aPinnedAt = a.pinnedIn?.[0]?.pinnedAt || a.createdAt;
        const bPinnedAt = b.pinnedIn?.[0]?.pinnedAt || b.createdAt;
        return new Date(bPinnedAt) - new Date(aPinnedAt);
      });
  }, [messages]);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadChatMedia] = useUploadChatMediaMutation();
  const [togglePinMessage] = useTogglePinMessageMutation();
  const [pinnedMessagesExpanded, setPinnedMessagesExpanded] = useState(false);

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

  // Hàm xử lý rời nhóm
  const handleLeaveGroup = async () => {
    if (!selectedConversation?.id) return;

    const confirmed = await confirmToast("Bạn có chắc chắn muốn rời nhóm này không?");
    if (!confirmed) return;

    try {
      socketService.leaveGroup({
        conversationId: selectedConversation.id
      });
      chatApi.util.invalidateTags(["Conversation"]);
      setSelectedConversation(null);
      
      // Nếu có onClose (modal), gọi onClose, không thì navigate
      if (onClose) {
        onClose();
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
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

  // Socket event handlers
  useEffect(() => {
    if (!selectedConversation?.id) return;

    // Join conversation room
    socketService.joinConversation(selectedConversation.id);
    
    // Refetch messages chỉ khi join conversation mới (khi conversationId thay đổi)
    if (conversationIdRef.current !== selectedConversation.id) {
      conversationIdRef.current = selectedConversation.id;
      // Refetch messages khi join conversation mới để đảm bảo có tất cả tin nhắn mới
      setTimeout(() => {
        refetch();
      }, 100);
    }

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

    const handleMessagePinned = (data) => {
      if (data.conversationId === selectedConversation.id) {
        refetch();
        chatApi.util.invalidateTags(['Message', 'PinnedMessages']);
      }
    };

    const handleChatError = (data) => {
      toast.error(data.message || "Có lỗi xảy ra");
    };

    const handleChatWarning = (data) => {
      toast.warning(data.message || "Cảnh báo");
    };

    const handleConversationUpdate = (data) => {
      // Nếu conversation hiện tại bị xóa
      if (data.action === 'delete' && data.conversationId === selectedConversation?.id) {
        setSelectedConversation(null);
        if (onClose) {
          onClose();
        } else {
          navigate('/chat');
        }
      }
      
      // Nếu có cập nhật và là conversation hiện tại, refetch data
      if (data.action === 'update' && data.conversationId === selectedConversation?.id) {
        refetchConversation();
        refetchMembers();
      }
    };

    const handleMessageReactionUpdated = (data) => {
      if (data.conversationId === selectedConversation?.id && data.messageId) {
        dispatch(
          reactionApi.util.invalidateTags([
            { type: 'Reaction', id: `MESSAGE_${data.messageId}` },
            { type: 'Reaction', id: `MESSAGE_${data.messageId}_stats` },
            { type: 'Reaction', id: `MESSAGE_${data.messageId}_me` },
          ])
        );
      }
    };

    socketService.on("chat:new_message", handleNewMessage);
    socketService.on("chat:message_edited", handleMessageEdited);
    socketService.on("chat:message_recalled", handleMessageRecalled);
    socketService.on("chat:message_pinned", handleMessagePinned);
    socketService.on("chat:message_reaction_updated", handleMessageReactionUpdated);
    socketService.on("chat:user_typing", handleTyping);
    socketService.on("message:status_update", handleMessageStatusUpdate);
    socketService.on("chat:error", handleChatError);
    socketService.on("chat:warning", handleChatWarning);
    socketService.on("chat:conversation_updated", handleConversationUpdate);
    return () => {
      socketService.off("chat:new_message", handleNewMessage);
      socketService.off("chat:message_edited", handleMessageEdited);
      socketService.off("chat:message_recalled", handleMessageRecalled);
      socketService.off("chat:message_pinned", handleMessagePinned);
      socketService.off("chat:message_reaction_updated", handleMessageReactionUpdated);
      socketService.off("chat:user_typing", handleTyping);
      socketService.off("message:status_update", handleMessageStatusUpdate);
      socketService.off("chat:error", handleChatError);
      socketService.off("chat:warning", handleChatWarning);
      socketService.off("chat:conversation_updated", handleConversationUpdate);
      socketService.leaveConversation(selectedConversation.id);
    };
  }, [selectedConversation?.id, currentUserId, refetch, refetchConversation, refetchMembers, navigate, onClose, setSelectedConversation, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoadingMessages && messages?.length > 0 && !didInitialScroll) {
      setTimeout(() => {
        scrollToBottom("auto");
        setDidInitialScroll(true);
      }, 0);
    }
  }, [isLoadingMessages, messages, didInitialScroll]);

  // Reset initial scroll flag when switching conversations
  useEffect(() => {
    setDidInitialScroll(false);
  }, [selectedConversation?.id]);

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
    if ((!message.trim() && selectedMedia.length === 0) || !selectedConversation?.id) return;
    
    // Kiểm tra quyền nhắn tin
    if (!canMessage.allowed) {
      toast.error(canMessage.reason || 'Bạn không thể nhắn tin cho người này');
      return;
    }

    const messageContent = message.trim();
    const mediaToSend = selectedMedia;
    
    setMessage("");
    setSelectedMedia([]);
    setReplyingTo(null);

    try {
      if (mediaToSend.length > 0) {
        const files = mediaToSend.map(m => m.file)
        const res = await uploadChatMedia({ conversationId: selectedConversation.id, files }).unwrap()
        const uploaded = res?.data?.files || []
        uploaded.forEach((u, idx) => {
          socketService.socket.emit("chat:send_message", {
            conversationId: selectedConversation.id,
            content: idx === 0 ? messageContent : null,
            type: u.type,
            mediaUrl: u.url,
            mediaType: u.mediaType,
            filename: u.filename || null,
            size: u.size || null,
            replyToId: null,
          });
        })
      } else {
        socketService.socket.emit("chat:send_message", {
          conversationId: selectedConversation.id,
          content: messageContent,
          type: "TEXT",
          replyToId: replyingTo?.id || null,
        });
      }

      setIsTyping(false);
      socketService.setTyping(selectedConversation.id, false);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageContent);
      setSelectedMedia(mediaToSend);
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
    if (event) {
      event.stopPropagation();
    }
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

  const isGroupAdmin = selectedConversation?.type === 'GROUP' && selectedConversation?.members?.find(m => m.user.id === currentUserId)?.role === 'ADMIN';

  const handleRemoveMember = async (memberId) => {
    if (!selectedConversation?.id) return;

    const member = selectedConversation.members.find(m => m.user.id === memberId);
    const memberName = member?.user?.fullName || member?.user?.username;
    
    const confirmed = await confirmToast(
      `Bạn có chắc chắn muốn xóa ${memberName} khỏi nhóm này không?`
    );
    
    if (!confirmed) return;

    try {
      socketService.removeMember({
        conversationId: selectedConversation.id,
        userId: memberId
      });
      
      if (memberId === currentUserId) {
        setSelectedConversation(null);
        if (onClose) {
          onClose();
        } else {
          navigate('/chat');
        }
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      const result = await togglePinMessage(messageId).unwrap();
      if (result?.success) {
        toast.success(result.message || 'Đã cập nhật trạng thái ghim tin nhắn');
        refetch();
        chatApi.util.invalidateTags(['Message', 'PinnedMessages']);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi ghim tin nhắn');
    }
  };

  const handleRecallMessage = async (messageId) => {
    try {
      socketService.recallMessage({
        messageId: messageId,
        conversationId: selectedConversation.id
      });
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  };

  const handleReactMessage = (messageId, reactionType = 'LIKE') => {
    if (!selectedConversation?.id || !messageId) return;
    
    try {
      socketService.reactMessage({
        messageId: parseInt(messageId),
        conversationId: selectedConversation.id,
        reactionType: reactionType.toUpperCase()
      });
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error reacting to message:", error);
      toast.error("Có lỗi xảy ra khi react tin nhắn");
    }
  };

  // Get message status icon using utility function
  const getMessageStatusIconWrapper = (message, compact = false) => {
    return getMessageStatusIcon({
      message,
      currentUserId,
      selectedConversation,
      isLastMessageInConversation,
      compact,
    });
  };

  return {
    // State
    message,
    setMessage,
    typingUsers,
    showMessageMenu,
    editingMessage,
    editContent,
    setEditContent,
    showEditHistory,
    setShowEditHistory,
    replyingTo,
    setReplyingTo,
    showAddMemberModal,
    setShowAddMemberModal,
    showMembersModal,
    setShowMembersModal,
    selectedMedia,
    setSelectedMedia,
    messagesEndRef,
    messageRefs,
    isEditing,
    pinnedMessagesExpanded,
    setPinnedMessagesExpanded,
    editHistoryData,
    
    // Data
    selectedConversation,
    displayUserInfo,
    displayIsLoading,
    messages,
    isLoadingMessages,
    conversationUserInfo,
    userInfo,
    canMessage,
    pinnedMessages,
    currentUserId,
    isGroupAdmin,
    
    // Functions
    handleTyping,
    handleSendMessage,
    handleKeyPress,
    handleMessageMenuClick,
    handleMenuAction,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyPress,
    handleShowEditHistory,
    scrollToMessage,
    handleRecallMessage,
    handlePinMessage,
    handleReactMessage,
    handleLeaveGroup,
    handleRemoveMember,
    isLastMessageInConversation,
    canEditMessage,
    getMessageStatusIconWrapper,
  };
};

