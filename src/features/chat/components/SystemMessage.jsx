import React from "react";

/**
 * SystemMessage - Component hiển thị tin nhắn hệ thống
 * @param {Object} props
 * @param {string} props.content - Nội dung tin nhắn hệ thống
 */
const SystemMessage = ({ content }) => {
  if (!content) return null;

  return (
    <div className="flex justify-center my-2">
      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
        {content}
      </div>
    </div>
  );
};

export default SystemMessage;

