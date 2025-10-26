import React from "react";
import { MessageCircle } from "lucide-react";

const DefaultChat = ({ onStartNewMessage, isLoading = false }) => {
  // Hiển thị skeleton loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-gray-900">
        {/* Messenger Icon Skeleton */}
        <div className=" w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-6"></div>

        {/* Title Skeleton */}
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>

        {/* Description Skeleton */}
        <div className="h-5 w-64 bg-gray-200 animate-pulse rounded mb-4"></div>

        {/* Button Skeleton */}
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white text-gray-900">
      {/* Messenger Icon - Đảo ngược màu sắc */}
      <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <MessageCircle className="w-14 h-14 text-white" />
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
        className="bg-primary-btn text-white px-6 py-2 rounded-3xl font-semibold hover:bg-primary-btn-hover transition-colors"
        onClick={onStartNewMessage}
      >
        Gửi tin nhắn
      </button>
    </div>
  );
};

export default DefaultChat;
