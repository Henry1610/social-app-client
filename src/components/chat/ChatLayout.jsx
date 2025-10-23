import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMain from './ChatMain';

const ChatLayout = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen bg-white text-gray-900 chat-layout-collapsed">
      {/* Chat Sidebar */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        <ChatSidebar 
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Chat Main Area */}
      <div className="flex-1">
        <ChatMain 
          selectedConversation={selectedConversation}
          onStartNewMessage={() => setSelectedConversation(null)}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
