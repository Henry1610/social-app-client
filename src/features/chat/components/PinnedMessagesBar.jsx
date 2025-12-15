    import React from "react";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import { Pin, ChevronUp } from "lucide-react";

/**
 * PinnedMessagesBar - Component hiển thị thanh tin nhắn đã ghim
 * @param {Object} props
 * @param {Array} props.pinnedMessages - Danh sách tin nhắn đã ghim
 * @param {boolean} props.isExpanded - Trạng thái mở rộng
 * @param {Function} props.onToggle - Callback khi toggle expand/collapse
 * @param {Function} props.onMessageClick - Callback khi click vào tin nhắn
 */
const PinnedMessagesBar = ({
  pinnedMessages = [],
  isExpanded = false,
  onToggle,
  onMessageClick,
}) => {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
      <div className="px-4 py-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 ease-in-out active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Pin size={16} className="text-blue-500 fill-blue-500 transition-transform duration-200 ease-in-out" />
            <span className="text-sm font-semibold text-gray-700">
              Tin nhắn đã ghim
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full transition-colors duration-200">
              {pinnedMessages.length}
            </span>
          </div>
          <div
            className="transition-transform duration-300 ease-in-out"
            style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <ChevronUp size={16} className="text-gray-500" />
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="space-y-2 overflow-y-auto max-h-48">
            {pinnedMessages.map((msg, index) => {
              return (
                <div
                  key={`pinned-${msg.id}`}
                  onClick={() => onMessageClick?.(msg.id)}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 ease-in-out border border-gray-100 hover:border-blue-300 hover:shadow-sm active:scale-[0.98]"
                  style={{
                    animation: `slideDown 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <Pin
                    size={14}
                    className="text-blue-500 fill-blue-500 mt-1 flex-shrink-0 transition-transform duration-200 hover:scale-110"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900">
                        {msg.sender?.fullName || msg.sender?.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2 transition-colors duration-200 group-hover:text-gray-900">
                      {msg.content || "Đã gửi một tệp đính kèm"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinnedMessagesBar;

