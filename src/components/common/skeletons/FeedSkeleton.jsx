import React from "react";

/**
 * FeedSkeleton - Skeleton cho feed posts trên trang Home
 */
const FeedSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="border-b border-gray-200 w-full max-w-[600px] mx-auto px-2 md:px-0"
        >
          {/* Post Header Skeleton */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2">
                {/* Avatar Skeleton */}
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>

                {/* Right content skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Username and time skeleton */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Content skeleton - 2-3 lines */}
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Skeleton */}
          <div className="mb-3 mx-auto w-full rounded-md overflow-hidden bg-gray-200 animate-pulse aspect-square"></div>

          {/* Post Actions Skeleton */}
          <div className="mb-2 flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="mb-1">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Comments skeleton */}
          <div className="mb-1">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedSkeleton;

