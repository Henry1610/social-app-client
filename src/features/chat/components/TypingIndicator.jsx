import React from "react";

/**
 * TypingIndicator - Component hiển thị indicator khi user đang gõ
 * @param {Object} props
 * @param {Array} props.typingUsers - Danh sách users đang gõ
 */
const TypingIndicator = ({ typingUsers = [] }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  return (
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
  );
};

export default TypingIndicator;

