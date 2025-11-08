import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevPathnameRef = useRef(location.pathname);

  // Mở chat - xử lý cho cả 2 trường hợp: modal hoặc full page
  const openChat = ({ conversationId, conversation }) => {
    if (!conversationId && !conversation) return;
    
    const conv = conversation || { id: conversationId };
    setSelectedConversation(conv);
    
    const isOnChatPage = location.pathname.startsWith('/chat');
    
    if (isOnChatPage) {
      // Đang ở trang chat → Navigate đến conversation
      navigate(`/chat/${conv.id}`);
      setIsModalOpen(false); // Đóng modal nếu có
    } else {
      // Ở trang khác → Mở modal
      setIsModalOpen(true);
    }
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    // KHÔNG clear selectedConversation để giữ state
  };

  // Đóng hoàn toàn (clear cả conversation)
  const closeChat = () => {
    setIsModalOpen(false);
    setSelectedConversation(null);
  };

  // Khi vào /chat: Nếu có selectedConversation trong modal → Navigate đến conversation đó
  useEffect(() => {
    const isOnChatPage = location.pathname.startsWith('/chat');
    const wasOnChatPage = prevPathnameRef.current?.startsWith('/chat');
    
    if (isOnChatPage && !wasOnChatPage) {
      // Vừa vào /chat từ trang khác
      if (selectedConversation && location.pathname === '/chat') {
        // Đang ở /chat (chưa có conversationId) và có selectedConversation
        // → Navigate đến conversation đó
        navigate(`/chat/${selectedConversation.id}`);
        setIsModalOpen(false); // Đóng modal
      }
    } else if (!isOnChatPage && wasOnChatPage) {
      // Vừa ra khỏi /chat (về Home)
      if (selectedConversation) {
        // Có conversation đang chat → Mở modal với conversation đó
        setIsModalOpen(true);
      }
    }
    
    prevPathnameRef.current = location.pathname;
  }, [location.pathname, selectedConversation, navigate]);

  return (
    <ChatContext.Provider value={{
      selectedConversation,
      setSelectedConversation,
      isModalOpen,
      setIsModalOpen,
      openChat,
      closeModal,
      closeChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

