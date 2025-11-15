import { X } from "lucide-react";
import ModalUserItem from "../../profile/components/ModalUserItem";

/**
 * LikesModal - Modal hiển thị danh sách người đã thích bài viết
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Array} reactions - Danh sách reactions (likes)
 * @param {boolean} isLoading - Trạng thái loading
 * @param {string|number} currentUserId - ID của user hiện tại
 */
const LikesModal = ({ isOpen, onClose, reactions = [], isLoading, currentUserId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg min-h-[400px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center pt-2 px-2">
          <div className="w-6"></div>
          <h3 className="text-base font-semibold">Người đã thích</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          ) : reactions.length > 0 ? (
            <div>
              {reactions.map((reaction) => (
                <ModalUserItem
                  key={`${reaction.userId}-${reaction.id}`}
                  user={reaction.user}
                  currentUserId={currentUserId}
                  onClose={onClose}
                  isFollower={false}
                  isSelfProfile={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Chưa có ai thích bài viết này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;

