import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check } from 'lucide-react';
import { useLazySearchUsersQuery } from '../../search/api/searchApi';
import { useCreateConversationMutation } from '../api/chatApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [step, setStep] = useState(1); // 1: Chọn người dùng, 2: Đặt tên nhóm

  const currentUser = useSelector(selectCurrentUser);
  const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

  // Tìm kiếm người dùng với lazy query
  const [searchUsers, { data: searchData, isLoading: isSearching }] = useLazySearchUsersQuery();

  const users = searchData?.users || [];

  // Reset state khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
      setStep(1);
    }
  }, [isOpen]);

  // Tìm kiếm người dùng khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    }
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleNext = () => {
    if (selectedUsers.length >= 2) {
      setStep(2);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    try {
      const participantIds = selectedUsers.map(user => user.id);
      
      const result = await createConversation({
        type: 'GROUP',
        participantIds,
        name: groupName.trim()
      }).unwrap();

      if (result.success) {
        onGroupCreated?.(result.data.conversation);
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-btn" />
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 1 ? 'Tạo nhóm chat' : 'Đặt tên nhóm'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-3">
          {step === 1 ? (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      Đã chọn ({selectedUsers.length} người):
                    </p>
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

              {/* User List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Đang tìm kiếm...
                  </div>
                ) : searchQuery.length >= 2 && users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Không tìm thấy người dùng nào
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="text-center py-4 text-gray-500">
                    Nhập ít nhất 2 ký tự để tìm kiếm
                  </div>
                ) : (
                  users
                    .filter(user => user.id !== currentUser?.id) // Loại bỏ current user
                    .map(user => {
                      const isSelected = selectedUsers.some(u => u.id === user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={`flex items-center space-x-3 p-3 mb-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50`}
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
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? 'bg-gray-900' 
                              : 'border-2 border-gray-300'
                          }`}>
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </>
          ) : (
            <>
              {/* Group Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên nhóm..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {groupName.length}/100 ký tự
                </p>
              </div>

              {/* Selected Users Preview */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Thành viên ({selectedUsers.length + 1} người):
                </p>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <div className="space-y-2">
                    {/* Current user */}
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-100">
                      <img
                        src={currentUser?.avatarUrl || '/images/avatar-IG-mac-dinh-1.jpg'}
                        alt={currentUser?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {currentUser?.fullName || currentUser?.username} (Bạn)
                        </p>
                      </div>
                    </div>
                    
                    {/* Selected users */}
                    {selectedUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-100">
                        <img
                          src={user.avatarUrl || '/images/avatar-IG-mac-dinh-1.jpg'}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleNext}
                disabled={selectedUsers.length < 2}
                className="px-4 py-2 bg-primary-btn text-white rounded-lg hover:bg-hover-primary-btn disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp theo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <span>Tạo nhóm</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
