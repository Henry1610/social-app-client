import { useState } from "react";
import { X } from "lucide-react";
import { useGetReactionsQuery, useGetReactionStatsQuery } from "../api/reactionApi";
import ReactionUserItem from "./ReactionUserItem";
import { reactionTypesWithAll, getReactionType } from "../constants/reactionTypes";

/**
 * ReactionsModal - Modal hiển thị danh sách người đã reaction với tabs để filter theo type
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {number} targetId - ID của target (comment/post/repost)
 * @param {string} targetType - Type của target ("COMMENT", "POST", "REPOST")
 * @param {number} currentUserId - ID của user hiện tại
 */
const ReactionsModal = ({ isOpen, onClose, targetId, targetType, currentUserId }) => {
  const [selectedTab, setSelectedTab] = useState('ALL');

  // Fetch reactions
  const { data: reactionsData, isLoading: loadingReactions } = useGetReactionsQuery(
    { targetId, targetType },
    { skip: !isOpen || !targetId || !targetType }
  );

  // Fetch stats để hiển thị số lượng mỗi tab
  const { data: statsData } = useGetReactionStatsQuery(
    { targetId, targetType },
    { skip: !isOpen || !targetId || !targetType }
  );

  if (!isOpen) return null;

  const reactions = reactionsData?.reactions || [];
  const stats = statsData?.stats || {};

  // Filter reactions theo tab đã chọn
  const filteredReactions = selectedTab === 'ALL' 
    ? reactions 
    : reactions.filter(r => r.reactionType === selectedTab);

  const reactionTypes = reactionTypesWithAll;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-lg min-h-[400px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Người đã thả cảm xúc</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('ALL')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              selectedTab === 'ALL'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tất cả
          </button>
          {reactionTypes.slice(1).map((reaction) => {
            const count = stats[reaction.type] || 0;
            if (count === 0) return null;
            
            const IconComponent = reaction.icon;
            
            return (
              <button
                key={reaction.type}
                onClick={() => setSelectedTab(reaction.type)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTab === reaction.type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent size={18} />
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loadingReactions ? (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          ) : filteredReactions.length > 0 ? (
            filteredReactions.map((reaction) => (
              <ReactionUserItem
                key={`${reaction.userId}-${reaction.id}`}
                user={reaction.user}
                reactionType={reaction.reactionType}
                currentUserId={currentUserId}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {selectedTab === 'ALL' 
                ? 'Chưa có ai thả cảm xúc'
                : `Chưa có ai thả cảm xúc ${getReactionType(selectedTab)?.label.toLowerCase()}`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionsModal;
