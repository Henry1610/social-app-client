import React from "react";
import { X } from "lucide-react";

const RepostModal = ({
  isOpen,
  onClose,
  content,
  onContentChange,
  onConfirm,
  isLoading = false,
  zIndex = 50,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Đăng lại bài viết</h3>
          <button
            onClick={handleClose}
            className="absolute right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Thêm suy nghĩ của bạn (tùy chọn)..."
              className="w-full px-0 py-2 resize-none focus:outline-none text-sm placeholder:text-gray-400 min-h-[120px]"
              rows={5}
              maxLength={500}
            />
            <div className="absolute bottom-2 right-0">
              <span className={`text-xs ${content.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                {content.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#0095F6] text-white text-sm font-semibold rounded-lg hover:bg-[#0084d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng lại...
              </span>
            ) : (
              "Đăng lại"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;

