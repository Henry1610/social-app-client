import React from "react";

const InstagramSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-16 h-16">
        {/* Vòng xoay gradient */}
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-l-pink-500 border-r-purple-500 animate-spin"></div>
        {/* Logo hoặc chấm giữa */}
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default InstagramSpinner;
