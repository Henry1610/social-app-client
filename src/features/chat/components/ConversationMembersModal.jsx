import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash } from "lucide-react";

/**
 * ConversationMembersModal - Modal hiển thị danh sách thành viên trong conversation
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái mở/đóng modal
 * @param {Array} props.members - Danh sách thành viên
 * @param {boolean} props.isAdmin - Có phải admin không
 * @param {string} props.currentUserId - ID của user hiện tại
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onRemoveMember - Callback khi xóa thành viên
 */
const ConversationMembersModal = ({
  isOpen,
  members = [],
  isAdmin = false,
  currentUserId,
  onClose,
  onRemoveMember,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMemberClick = (username) => {
    if (username) {
      navigate(`/${username}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md mx-auto p-5 relative shadow-lg flex flex-col">
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={onClose}
          title="Đóng"
          tabIndex={0}
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">
          Danh sách thành viên
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto p-2">
          {members.map((m) => (
            <div
              key={m.user.id}
              className="flex items-center gap-3 border-b last:border-none pb-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => handleMemberClick(m.user.username)}
            >
              <img
                src={m.user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                className="w-10 h-10 rounded-full object-cover"
                alt={m.user.username}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 transition-colors">
                  {m.user.fullName || m.user.username}
                </div>
                <div className="text-xs text-gray-500">@{m.user.username}</div>
              </div>
              {m.role && (
                <div className="ml-auto px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-700 uppercase">
                  {m.role}
                </div>
              )}
              {isAdmin && m.user.id !== currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMember?.(m.user.id);
                  }}
                  className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                  title="Xoá thành viên"
                  tabIndex={0}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationMembersModal;

