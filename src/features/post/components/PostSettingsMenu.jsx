import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

function PostSettingsMenu({
  isOpen,
  onClose,
  whoCanSee = "everyone",
  whoCanComment = "everyone",
  onUpdatePrivacy,
  isUpdating = false,
}) {
  const menuRef = useRef(null);
  const [localWhoCanSee, setLocalWhoCanSee] = useState(whoCanSee);
  const [localWhoCanComment, setLocalWhoCanComment] = useState(whoCanComment);

  // Sync local state với props
  useEffect(() => {
    setLocalWhoCanSee(whoCanSee);
    setLocalWhoCanComment(whoCanComment);
  }, [whoCanSee, whoCanComment]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (
      localWhoCanSee !== whoCanSee ||
      localWhoCanComment !== whoCanComment
    ) {
      onUpdatePrivacy({
        whoCanSee: localWhoCanSee,
        whoCanComment: localWhoCanComment,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={menuRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Chỉnh sửa quyền riêng tư</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Ai có thể xem bài viết này?
            </p>
            <div className="relative">
              <select
                value={localWhoCanSee}
                onChange={(e) => setLocalWhoCanSee(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="everyone">
                  Công khai - Mọi người có thể xem
                </option>
                <option value="followers">
                  Người theo dõi - Chỉ người theo dõi bạn
                </option>
                <option value="nobody">Riêng tư - Chỉ bạn mới thấy</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Ai có thể bình luận?
            </p>
            <div className="relative">
              <select
                value={localWhoCanComment}
                onChange={(e) => setLocalWhoCanComment(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="everyone">
                  Mọi người có thể bình luận
                </option>
                <option value="followers">
                  Chỉ người theo dõi bạn
                </option>
                <option value="nobody">Chỉ bạn mới bình luận được</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostSettingsMenu;

