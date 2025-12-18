import React, { useRef, useEffect, useState } from "react";
import { MoreHorizontal, Edit, Copy, Undo, Reply, Pin, File, Download, FileText, FileImage, FileVideo, Archive, FileSpreadsheet } from "lucide-react";

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
  compact = false, // Prop để điều chỉnh kích thước cho modal
}) => {
  const menuButtonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Helper function để lấy icon dựa trên file type
  const getFileIcon = (mediaType, filename) => {
    if (!mediaType && !filename) return File;
    
    const type = mediaType?.toLowerCase() || '';
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    
    if (type.includes('pdf') || ext === 'pdf') return FileText;
    if (type.includes('word') || ext === 'doc' || ext === 'docx') return FileText;
    if (type.includes('excel') || type.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx') return FileSpreadsheet;
    if (type.includes('zip') || type.includes('rar') || ext === 'zip' || ext === 'rar' || ext === '7z') return Archive;
    if (type.includes('image')) return FileImage;
    if (type.includes('video')) return FileVideo;
    return File;
  };

  // Helper function để format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Cập nhật vị trí modal khi mở
  useEffect(() => {
    if (showMessageMenu === message.id && menuButtonRef.current) {
      const updatePosition = () => {
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.top,
          left: rect.left,
          right: window.innerWidth - rect.right,
        });
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showMessageMenu, message.id]);

  return (
    <div className="w-full">
      {/* Reply indicator - hiển thị phía trên tin nhắn */}
      {message.replyTo && (
        <div className={`mb-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
          {/* Label */}
          <div
            className={`${
              compact ? "text-[10px]" : "text-xs"
            } text-gray-500 mb-1 ${
              isOwnMessage
                ? compact
                  ? "pr-2 pl-2"
                  : "pr-4 pl-4"
                : compact
                ? "pr-2 pl-10"
                : "pr-4 pl-14 sm:pl-16"
            }`}
          >
            {message.senderId === currentUserId
              ? message.replyTo.senderId === currentUserId
                ? "Bạn đã trả lời chính mình"
                : `Bạn đã trả lời ${
                    message.replyTo.sender?.fullName ||
                    message.replyTo.sender?.username
                  }`
              : message.replyTo.senderId === currentUserId
              ? `${
                  message.sender?.fullName || message.sender?.username
                } đã trả lời bạn`
              : message.replyTo.senderId === message.senderId
              ? `${
                  message.sender?.fullName || message.sender?.username
                } đã trả lời chính mình`
              : `${
                  message.sender?.fullName || message.sender?.username
                } đã trả lời ${
                  message.replyTo.sender?.fullName ||
                  message.replyTo.sender?.username
                }`}
          </div>

          {/* Tin nhắn gốc được reply */}
          <div
            className={`${
              isOwnMessage
                ? compact
                  ? "flex justify-end pr-8"
                  : "flex justify-end pr-12"
                : compact
                ? "flex justify-start pl-10"
                : "flex justify-start pl-14 sm:pl-16"
            }`}
          >
            <div
              className={`${compact ? "px-2 py-1" : "px-3 py-2"} rounded-lg ${
                compact ? "text-xs" : "text-sm"
              } ${
                compact ? "max-w-[160px]" : "max-w-xs"
              } cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 text-gray-600`}
              onClick={() =>
                onScrollToMessage && onScrollToMessage(message.replyTo.id)
              }
            >
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex ${
          isOwnMessage
            ? compact
              ? "justify-end mr-2"
              : "justify-end mr-4"
            : "justify-start"
        } group relative`}
      >
        <div
          className={`flex ${
            compact ? "max-w-[200px]" : "max-w-xs lg:max-w-md"
          } ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end ${
            compact ? "space-x-1.5" : "space-x-2"
          }`}
        >
          {/* Avatar */}
          {!isOwnMessage && showAvatar && (
            <div
              className={`${
                compact ? "w-6 h-6" : "w-8 h-8"
              } rounded-full overflow-hidden flex-shrink-0`}
            >
              {message.sender?.avatarUrl ? (
                <img
                  src={message.sender.avatarUrl}
                  alt={message.sender.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {message.sender?.fullName?.charAt(0)?.toUpperCase() ||
                      message.sender?.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Spacer cho tin nhắn không có avatar */}
          {!isOwnMessage && !showAvatar && (
            <div className={`${compact ? "w-6 h-6" : "w-8 h-8"}`}></div>
          )}

          {/* Message bubble */}
          <div
            className={`relative ${
              message.isRecalled
                ? compact
                  ? "px-3 py-1.5"
                  : "px-5 py-2"
                : message.mediaUrl && !message.content
                ? "p-0 bg-transparent"
                : compact
                ? "px-3 py-1.5"
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
                  className={`w-full bg-transparent ${
                    compact ? "text-xs" : "text-sm"
                  } leading-relaxed resize-none focus:outline-none`}
                  rows={Math.max(1, editContent.split("\n").length)}
                  autoFocus
                />
                <div
                  className={`flex gap-2 ${
                    compact ? "text-[10px]" : "text-xs"
                  }`}
                >
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
              <div
                className={`${
                  compact ? "text-xs" : "text-sm"
                } leading-relaxed flex items-center flex-col ${
                  compact ? "space-y-1" : "space-y-2"
                }`}
              >
                {message.isRecalled ? (
                  <span
                    className={`text-[13px] italic ${
                      isOwnMessage ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    Tin nhắn đã được thu hồi
                  </span>
                ) : (
                  <>
                    {message.mediaUrl && (
                      <div className="w-full">
                        {message.type === "IMAGE" ? (
                          <img
                            src={message.mediaUrl}
                            alt="Media"
                            onClick={() => setPreviewImage(message.mediaUrl)}
                            className={`cursor-pointer w-auto h-auto ${
                              compact
                                ? "max-w-[180px] max-h-[180px]"
                                : "max-w-xs max-h-64"
                            } rounded-lg object-contain`}
                          />
                        ) : message.type === "VIDEO" ? (
                          <video
                            src={message.mediaUrl}
                            controls
                            onClick={() => setPreviewVideo(message.mediaUrl)}
                            className={`w-auto h-auto ${
                              compact
                                ? "max-w-[180px] max-h-[180px]"
                                : "max-w-xs max-h-64"
                            } rounded-lg object-contain`}
                          />
                        ) : message.type === "FILE" ? (
                          <a
                            href={message.mediaUrl}
                            download={message.filename || 'file'}
                            className={`flex items-center gap-3 ${
                              compact ? 'p-2' : 'p-3'
                            } bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group`}
                          >
                            <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center bg-white rounded-lg border border-gray-200 flex-shrink-0`}>
                              {React.createElement(getFileIcon(message.mediaType, message.filename), {
                                className: `${compact ? 'w-5 h-5' : 'w-6 h-6'} text-gray-600`
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`}>
                                {message.filename || 'File'}
                              </p>
                              {message.size && (
                                <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-0.5`}>
                                  {formatFileSize(message.size)}
                                </p>
                              )}
                            </div>
                            <Download className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0`} />
                          </a>
                        ) : null}
                      </div>
                    )}
                    {message.content && (
                      <p>
                        {message.content}
                        {message.updatedAt &&
                          message.updatedAt !== message.createdAt && (
                            <span
                              onClick={() => onShowEditHistory(message.id)}
                              className={`text-[11px] italic cursor-pointer hover:underline ${
                                isOwnMessage ? "text-white/70" : "text-gray-400"
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
              ref={menuButtonRef}
              onClick={(e) => {
                if (e) e.stopPropagation();
                // Lấy vị trí button ngay khi click
                if (menuButtonRef.current) {
                  const rect = menuButtonRef.current.getBoundingClientRect();
                  setMenuPosition({
                    top: rect.top,
                    left: rect.left,
                    right: window.innerWidth - rect.right,
                  });
                }
                onMessageMenuClick(message.id, e);
              }}
              className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-black/10 pointer-events-auto"
              style={{
                [isOwnMessage ? "left" : "right"]: "-30px",
                visibility:
                  showMessageMenu === message.id ? "visible" : "inherit",
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {/* Context Menu - xuất hiện từ nút dấu 3 chấm, phía trên */}
            {showMessageMenu === message.id && menuPosition.top > 0 && (
              <div
                className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[180px]"
                style={{
                  top: `${menuPosition.top - 8}px`,
                  [isOwnMessage ? "right" : "left"]: isOwnMessage
                    ? `${menuPosition.right}px`
                    : `${menuPosition.left}px`,
                  transform: "translateY(-100%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Time header - chỉ hiển thị thời gian */}
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* Menu items */}
                <div className="py-1 px-1.5">
                  {message.content && (
                    <button
                      onClick={() => {
                        onMenuAction("copy", message.id);
                        onMessageMenuClick(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <span>Sao chép</span>
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}

                  {canEditMessage(message) &&
                    !message.mediaUrl &&
                    message.content && (
                      <button
                        onClick={() => {
                          onMenuAction("edit", message.id);
                          onMessageMenuClick(null);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Chỉnh sửa</span>
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    )}

                  <button
                    onClick={() => {
                      onMenuAction("reply", message.id);
                      onMessageMenuClick(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <span>Trả lời</span>
                    <Reply className="w-4 h-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => {
                      onPinMessage && onPinMessage(message.id);
                      onMessageMenuClick(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <span>
                      {message.pinnedIn && message.pinnedIn.length > 0
                        ? "Bỏ ghim"
                        : "Ghim tin nhắn"}
                    </span>
                    <Pin
                      className={`w-4 h-4 ${
                        message.pinnedIn && message.pinnedIn.length > 0
                          ? "text-blue-500 fill-blue-500"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>

                {/* Separator và nút Thu hồi */}
                {isOwnMessage && !message.isRecalled && (
                  <>
                    <div className="border-t border-gray-100 mx-1.5"></div>
                    <div className="px-1.5 py-1">
                      <button
                        onClick={() => {
                          onRecallMessage && onRecallMessage(message.id);
                          onMessageMenuClick(null);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-red-500 hover:bg-red-50 flex items-center justify-between bg-red-50/50 transition-colors"
                      >
                        <span>Thu hồi</span>
                        <Undo className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Message status icon - chỉ hiển thị khi tin nhắn cuối cùng là của mình */}
          {isOwnMessage &&
            !(message.updatedAt && message.updatedAt !== message.createdAt) &&
            isLastMessageInConversation(message) && (
              <div
                className={`absolute -bottom-1 -right-1 ${
                  compact ? "p-0.5" : "p-1"
                } bg-white border border-gray-200 rounded-full shadow-sm`}
              >
                {getMessageStatusIcon
                  ? getMessageStatusIcon(message, compact)
                  : null}
              </div>
            )}

          {/* Spacer for alignment */}
          {isOwnMessage && showAvatar && (
            <div className={`${compact ? "w-6 h-6" : "w-8 h-8"}`}></div>
          )}
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg object-contain"
            alt="Preview"
          />
        </div>
      )}
      {previewVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewVideo(null)}
        >
          <video
            src={previewVideo}
            controls
            autoPlay
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
