import React from "react";

const ModalSkeleton = ({ count = 8, showButtons = true }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            
            {/* Text skeleton */}
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
          
          {/* Button skeleton - chỉ hiện khi showButtons = true */}
          {showButtons && (
            <div className="flex items-center gap-2">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-20"></div>
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-12"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModalSkeleton;
