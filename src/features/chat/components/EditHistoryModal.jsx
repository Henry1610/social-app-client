import React from "react";

const EditHistoryModal = ({ 
  showEditHistory, 
  onClose, 
  editHistoryData 
}) => {
  if (!showEditHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Lịch sử chỉnh sửa
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {editHistoryData?.data?.editHistory ? (
            <div className="space-y-3">
              {editHistoryData.data.editHistory.map((edit) => (
                <div
                  key={edit.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          edit.editor.avatarUrl ||
                          "/images/avatar-IG-mac-dinh-1.jpg"
                        }
                        alt={edit.editor.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">
                        {edit.editor.fullName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(edit.editedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Từ:</span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {edit.oldContent}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Thành:</span>
                      <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                        {edit.newContent}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Không có lịch sử chỉnh sửa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;
