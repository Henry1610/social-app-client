import React from "react";
import {
  MoreHorizontal,
  Edit,
  Copy,
  Undo,
  Reply,
  Pin,
} from "lucide-react";

const MessageItem = ({
  message,
  isOwnMessage,
  showAvatar,
  currentUserId,
  isLastMessageInConversation,
  canEditMessage,
  onMenuAction,
  onShowEditHistory,
  onMessageMenuClick,
  showMessageMenu,
  editingMessage,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
  onEditKeyPress,
  isEditing,
  getMessageStatusIcon,
  onScrollToMessage,
  onRecallMessage,
  onPinMessage,
}) => {
  return (
    <div className="w-full">
      {/* Reply indicator - hiển thị phía trên tin nhắn */}
      {message.replyTo && (
        <div className={`mb-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
          {/* Label */}
          <div className={`text-xs text-gray-500 mb-1 ${isOwnMessage ? "pr-4 pl-4" : "pr-4 pl-14 sm:pl-16"}`}>
            {message.senderId === currentUserId 
              ? (message.replyTo.senderId === currentUserId 
                  ? "Bạn đã trả lời chính mình" 
                  : `Bạn đã trả lời ${message.replyTo.sender?.fullName || message.replyTo.sender?.username}`)
              : (message.replyTo.senderId === currentUserId
                  ? `${message.sender?.fullName || message.sender?.username} đã trả lời bạn`
                  : message.replyTo.senderId === message.senderId
                    ? `${message.sender?.fullName || message.sender?.username} đã trả lời chính mình`
                    : `${message.sender?.fullName || message.sender?.username} đã trả lời ${message.replyTo.sender?.fullName || message.replyTo.sender?.username}`)
            }
          </div>
          
          {/* Tin nhắn gốc được reply */}
          <div className={`${isOwnMessage ? "flex justify-end pr-12" : "flex justify-start pl-14 sm:pl-16"}`}>
            <div 
              className={`px-3 py-2 rounded-lg text-sm max-w-xs cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 text-gray-600`}
              onClick={() => onScrollToMessage && onScrollToMessage(message.replyTo.id)}
            >
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex ${
          isOwnMessage
            ? "justify-end mr-4"
            : "justify-start"
        } group relative`}
      >
        <div
          className={`flex max-w-xs lg:max-w-md ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2`}
        >
          {/* Avatar */}
          {!isOwnMessage && showAvatar && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {message.sender?.avatarUrl ? (
                <img
                  src={message.sender.avatarUrl}
                  alt={message.sender.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {message.sender?.fullName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      message.sender?.username
                        ?.charAt(0)
                        ?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Spacer cho tin nhắn không có avatar */}
          {!isOwnMessage && !showAvatar && (
            <div className="w-8 h-8"></div>
          )}

          {/* Message bubble */}
          <div
            className={`relative ${
              message.isRecalled 
                ? "px-5 py-2"
                : message.mediaUrl && !message.content 
                  ? "p-0 bg-transparent" 
                  : "px-5 py-2"
            } rounded-2xl ${
              message.isRecalled
                ? isOwnMessage
                  ? "bg-primary-btn text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
                : message.mediaUrl && !message.content
                  ? ""
                  : isOwnMessage
                    ? "bg-primary-btn text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
            } group/message`}
          >
            {message.pinnedIn && message.pinnedIn.length > 0 && (
              <div className="absolute -top-2 left-2 bg-blue-500 rounded-full p-1">
                <Pin size={10} className="text-white fill-white" />
              </div>
            )}
            {editingMessage === message.id ? (
              // Edit mode
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={onEditKeyPress}
                  className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none"
                  rows={Math.max(1, editContent.split("\n").length)}
                  autoFocus
                />
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={onSaveEdit}
                    disabled={isEditing || !editContent.trim()}
                    className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-50"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-2 py-1 bg-white/20 rounded hover:bg-white/30"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              // Normal mode
              <div className="text-sm leading-relaxed flex items-center flex-col space-y-2">
                {message.isRecalled ? (
                  <span className={`text-[13px] italic ${
                    isOwnMessage
                      ? "text-white/70"
                      : "text-gray-400"
                  }`}>
                    Tin nhắn đã được thu hồi
                  </span>
                ) : (
                  <>
                    {message.mediaUrl && (
                      <div className="w-full">
                        {message.type === 'IMAGE' ? (
                          <img 
                            src={message.mediaUrl} 
                            alt="Media" 
                            className="w-auto h-auto max-w-xs max-h-64 rounded-lg object-contain"
                          />
                        ) : message.type === 'VIDEO' ? (
                          <video 
                            src={message.mediaUrl} 
                            controls
                            className="w-auto h-auto max-w-xs max-h-64 rounded-lg object-contain"
                          />
                        ) : null}
                      </div>
                    )}
                    {message.content && (
                      <p>
                        {message.content}
                        {message.updatedAt && message.updatedAt !== message.createdAt && (
                          <span
                            onClick={() => onShowEditHistory(message.id)}
                            className={`text-[11px] italic cursor-pointer hover:underline ${
                              isOwnMessage
                                ? "text-white/70"
                                : "text-gray-400"
                            }`}
                            title="Đã chỉnh sửa"
                          >
                            (đã chỉnh sửa)
                          </span>
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Hover menu button */}
            <button
              onClick={(e) => onMessageMenuClick(message.id, e)}
              className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-black/10"
              style={{
                [isOwnMessage ? "left" : "right"]: "-30px",
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {/* Context Menu */}
            {showMessageMenu === message.id && (
              <div
                className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
                style={{
                  bottom: "100%",
                  marginBottom: "8px",
                  [isOwnMessage ? "left" : "right"]: "-160px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Time header */}
                <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100">
                  {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    weekday: "short",
                  })}
                </div>

                {/* Menu items */}
                {canEditMessage(message) && !message.mediaUrl && message.content && (
                  <button
                    onClick={() => onMenuAction("edit", message.id)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    Chỉnh sửa
                  </button>
                )}

                <button
                  onClick={() => onMenuAction("reply", message.id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Reply className="w-4 h-4 text-gray-600" />
                  Trả lời
                </button>

                {message.content && (
                  <button
                    onClick={() => onMenuAction("copy", message.id)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                    Sao chép
                  </button>
                )}

                <button
                  onClick={() => onPinMessage && onPinMessage(message.id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Pin className={`w-4 h-4 ${message.pinnedIn && message.pinnedIn.length > 0 ? 'text-blue-500 fill-blue-500' : 'text-gray-600'}`} />
                  {message.pinnedIn && message.pinnedIn.length > 0 ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                </button>

                {/* Separator */}
                <div className="border-t border-gray-100 my-1"></div>

                {isOwnMessage && !message.isRecalled && (
                  <button
                    onClick={() => onRecallMessage && onRecallMessage(message.id)}
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3"
                  >
                    <Undo className="w-4 h-4 text-red-500" />
                    Thu hồi
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Message status icon - chỉ hiển thị khi tin nhắn cuối cùng là của mình */}
          {isOwnMessage &&
            !(message.updatedAt && message.updatedAt !== message.createdAt) &&
            isLastMessageInConversation(message) && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
                {getMessageStatusIcon(message)}
              </div>
            )}

          {/* Spacer for alignment */}
          {isOwnMessage && showAvatar && (
            <div className="w-8 h-8"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
