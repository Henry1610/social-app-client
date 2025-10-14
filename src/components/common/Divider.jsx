import React from "react";

export default function FacebookLoginButton({ text }) { 
  return (
    <div className="flex items-center my-4">
    <div className="flex-1 h-px bg-gray-300" />
    <p className="px-3 text-xs text-gray-500 font-semibold">{text}</p>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
  );
}
