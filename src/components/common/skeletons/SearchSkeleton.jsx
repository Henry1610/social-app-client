import React from "react";

/**
 * Search Skeleton - Skeleton cho kết quả tìm kiếm
 */
const SearchSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-2">
          {/* Avatar skeleton */}
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          
          {/* Text skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchSkeleton;

