import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChatProvider, useChat } from '../../contexts/ChatContext';
import ChatSidebar from '../../features/chat/ChatSidebar';

const ChatLayoutContent = () => {
  const { selectedConversation, setSelectedConversation, searchQuery, setSearchQuery } = useChat();
  const navigate = useNavigate();

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/chat/${conversation.id}`);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 chat-layout-collapsed">
      {/* Chat Sidebar */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        <ChatSidebar 
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Chat Main Area */}
      <div className="flex-1">
        <Outlet /> {/* Hiển thị children routes */}
      </div>
    </div>
  );
};

const ChatLayout = () => {
  return (
    <ChatProvider>
      <ChatLayoutContent />
    </ChatProvider>
  );
};

export default ChatLayout;