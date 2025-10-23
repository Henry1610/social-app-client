import React from "react";
import { MessageCircle, Send } from "lucide-react";

const ChatMain = ({ selectedConversation, onStartNewMessage }) => {
  if (selectedConversation) {
    // Hiển thị cuộc trò chuyện đã chọn
    return (
      <div className="flex flex-col h-full bg-white text-gray-900">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900">
                {selectedConversation.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {selectedConversation.name}
              </h3>
              <p className="text-sm text-gray-600">Active now</p>
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 mt-8">
            <p>Start chatting with {selectedConversation.name}</p>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="p-2 rounded-full bg-blue-500 text-white">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện khi chưa chọn cuộc trò chuyện nào
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white text-gray-900">
      {/* Messenger Icon - Đảo ngược màu sắc */}
      <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        Tin nhắn của bạn
      </h2>

      {/* Description */}
      <p className="text-gray-600 mb-4 text-center whitespace-nowrap">
        Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
      </p>

      {/* Send Message Button */}
      <button
        className="bg-primary-btn text-white px-6 py-2 rounded-3xl font-semibold hover:bg-primary-btn-hover   transition-colors"
        onClick={onStartNewMessage}
      >
        Gửi tin nhắn
      </button>
    </div>
  );
};

export default ChatMain;
