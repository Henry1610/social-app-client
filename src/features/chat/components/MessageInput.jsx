import React from "react";
import { Send, Smile, Paperclip } from "lucide-react";

const MessageInput = ({
  message,
  setMessage,
  onTyping,
  onKeyPress,
  onSendMessage,
  replyingTo,
  selectedConversation,
}) => {
  return (
    <div className="p-4 border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        {/* Attachment button */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative border rounded-full">
          <input
            type="text"
            placeholder={replyingTo ? "Nhập tin nhắn trả lời..." : "Nhập tin nhắn..."}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyPress={onKeyPress}
            className="w-full py-2 px-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:bg-white transition-colors"
            disabled={!selectedConversation}
          />

          {/* Emoji button */}
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={onSendMessage}
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
  );
};

export default MessageInput;
