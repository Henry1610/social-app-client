import React from "react";

/**
 * Chat Skeletons - Các skeleton cho tính năng chat
 */

// Skeleton cho message item (tin nhắn)
export const MessageSkeleton = ({ count = 3, isCompact = false }) => {
  if (isCompact) {
    return (
      <div className="space-y-1.5">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-12 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 w-36 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton cho conversation list item (danh sách cuộc trò chuyện)
export const ConversationItemSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton cho chat header (header của chat)
export const ChatHeaderSkeleton = () => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="space-y-[1px]">
          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton cho user profile card (thẻ thông tin người dùng trong chat)
export const UserProfileCardSkeleton = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Avatar Skeleton */}
      <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>

      {/* User Info Skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Button Skeleton */}
      <div className="w-full">
        <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
};

// Skeleton cho message input (ô nhập tin nhắn)
export const MessageInputSkeleton = () => {
  return (
    <div className="p-6 border-gray-200">
      <div className="h-12 bg-gray-200 animate-pulse rounded-full"></div>
    </div>
  );
};

// Skeleton cho default chat screen (màn hình chat mặc định)
export const DefaultChatSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      {/* Messenger Icon Skeleton */}
      <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-6"></div>

      {/* Title Skeleton */}
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>

      {/* Description Skeleton */}
      <div className="h-5 w-64 bg-gray-200 animate-pulse rounded mb-4"></div>

      {/* Button Skeleton */}
      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-3xl"></div>
    </div>
  );
};

// Skeleton cho conversation list trong modal (compact version)
export const ConversationListModalSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-1.5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2 p-1.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-2.5 w-28 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

