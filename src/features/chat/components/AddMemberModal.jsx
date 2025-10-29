import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { useLazySearchUsersQuery } from '../../profile/profileApi';
import socketService from '../../../services/socket';

const AddMemberModal = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  currentMembers = [],
  onMemberAdded 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const [searchUsers, { data: searchResults, isLoading: isSearching }] = useLazySearchUsersQuery();

  // Tìm kiếm người dùng khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers(searchQuery);
    }
  }, [searchQuery, searchUsers]);

  // Lọc bỏ những người đã có trong group
  const filteredResults = searchResults?.users?.filter(user => 
    !currentMembers.some(member => member.user.id === user.id)
  ) || [];

  const handleUserSelect = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsAdding(true);
    try {
      // Gửi socket event để thêm thành viên
      socketService.addMembers({
        conversationId: conversationId,
        memberIds: selectedUsers.map(user => user.id)
      });
      
      // Gọi callback để cập nhật UI
      onMemberAdded?.(selectedUsers);
      
      // Reset form
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Thêm thành viên
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Đã chọn ({selectedUsers.length} người):
            </p>
            <div className="max-h-20 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.fullName || user.username}</span>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto max-h-60">
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          ) : searchQuery.trim().length > 0 ? (
            filteredResults.length > 0 ? (
              <div className="p-2">
                {filteredResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.some(u => u.id === user.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={user.avatarUrl || '/images/avatar-IG-mac-dinh-1.jpg'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Không tìm thấy người dùng nào</p>
              </div>
            )
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nhập tên hoặc username để tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isAdding}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm ({selectedUsers.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
