import React from "react";

/**
 * Profile Skeleton - Skeleton cho trang profile
 */
const ProfileSkeleton = () => {
  return (
    <div className="w-full min-w-0 md:ml-[var(--feed-sidebar-width)] flex flex-1 justify-center pb-20 md:pb-0 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-8 min-w-0">
        {/* Header Skeleton */}
        <div className="flex gap-6 md:gap-12 mb-6 md:mb-12">
          {/* Avatar Skeleton */}
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>

          {/* User Info Skeleton */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
              {/* Username skeleton */}
              <div className="h-6 md:h-8 w-24 md:w-32 bg-gray-200 rounded animate-pulse"></div>
              {/* Follow button skeleton */}
              <div className="h-8 w-20 md:w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="flex gap-6 md:gap-10 mb-4 md:mb-6">
              <div className="h-5 md:h-6 w-12 md:w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 md:h-6 w-16 md:w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 md:h-6 w-20 md:w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Full name skeleton */}
            <div className="h-5 md:h-6 w-32 md:w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex justify-center gap-6 md:gap-12 mb-4 md:mb-8 border-t border-gray-300 pt-4">
          <div className="h-6 w-12 md:w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-16 md:w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-12 md:w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Posts grid skeleton */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;

