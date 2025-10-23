import React from "react";
import { Search, User, ChevronDown, Edit } from "lucide-react";

const ChatSidebar = ({
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}) => {
  // Mock data - sẽ thay thế bằng data thật từ API
  const conversations = [];
  const notes = {
    avatar: "/images/avatar-IG-mac-dinh-1.jpg",
    content: "Ghi chú...",
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header */}
      <div className="pt-10 px-4 flex items-center justify-end">
        <Edit className="w-7 h-7 text-gray-600 cursor-pointer justify-content-end" />
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="font-bold text-xl pt-4 px-2">Tin nhắn</div>
      </div>


      {/* Conversation List / Placeholder */}
      <div className="flex-1 px-6 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className=" text-gray-500 ">
            <p className="text-sm">
              Chats will appear here after you send or receive a message
            </p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`rounded-lg cursor-pointer ${
                  selectedConversation?.id === conv.id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onSelectConversation(conv)}
              >
                <p className="font-medium">{conv.name}</p>
                <p className="text-sm text-gray-500">{conv.lastMessage}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
