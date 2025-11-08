import React from "react";

/**
 * EmptyMessagesState - Component hiển thị khi chưa có tin nhắn nào
 */
const EmptyMessagesState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <p className="text-sm">Chưa có tin nhắn nào</p>
      <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
    </div>
  );
};

export default EmptyMessagesState;

