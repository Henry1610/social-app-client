import React from "react";
import { Reply, X } from "lucide-react";

const ReplyPreview = ({ replyingTo, onCancelReply }) => {
  if (!replyingTo) return null;

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Reply className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">
              Trả lời {replyingTo.sender?.fullName || replyingTo.sender?.username}
            </p>
            <p className="text-sm text-gray-700 truncate">
              {replyingTo.content}
            </p>
          </div>
        </div>
        <button
          onClick={onCancelReply}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ReplyPreview;
