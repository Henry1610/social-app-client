import React from "react";

const NotificationSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          {/* Avatar skeleton */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
