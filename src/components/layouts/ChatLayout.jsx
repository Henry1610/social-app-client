import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import ChatSidebar from '../../features/chat/ChatSidebar';

const ChatLayout = () => {
  const { 
    selectedConversation, 
    setSelectedConversation
  } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Luôn navigate đến conversation khi ở trong ChatLayout
    navigate(`/chat/${conversation.id}`);
  };

  // Kiểm tra xem có đang ở conversation detail không
  const isConversationDetail = location.pathname !== '/chat' && location.pathname.startsWith('/chat/');

  return (
    <div className="flex h-screen bg-white text-gray-900 chat-layout-collapsed">
      {/* Chat Sidebar - Desktop: luôn hiển thị, Mobile: chỉ hiển thị khi không ở conversation detail */}
      <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${
        isConversationDetail ? 'hidden md:flex' : 'flex'
      }`}>
        <ChatSidebar 
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Main Area - Desktop: luôn hiển thị, Mobile: chỉ hiển thị khi ở conversation detail */}
      <div className={`flex-1 ${
        isConversationDetail 
          ? 'flex flex-col' 
          : 'hidden md:flex md:flex-col'
      }`}>
        <Outlet /> {/* Hiển thị children routes */}
      </div>
    </div>
  );
};

export default ChatLayout;