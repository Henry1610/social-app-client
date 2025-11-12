import React from "react";
import { X } from "lucide-react";
import { NotificationCenter } from "../../features/notification/components/NotificationCenter";
import SearchPanel from "../../features/search/components/SearchPanel";

const SidePanel = ({
  active,
  value,
  setValue,
  isFetching,
  searchData,
  historyData,
  clearing,
  onClearHistory,
  onRecordSelection,
  onDeleteHistoryItem,
  onNavigate,
  onClose,
  onSelect,
}) => {
  if (!active || !["Tìm kiếm", "Thông báo"].includes(active)) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-[80px] h-full bg-white border-r shadow-xl transition-all duration-300 z-30 ${
        active ? "w-[400px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-5 overflow-hidden"
      }`}
    >
      {active === "Tìm kiếm" && (
        <div className="p-5">
          <SearchPanel
            value={value}
            setValue={setValue}
            isFetching={isFetching}
            searchData={searchData}
            historyData={historyData}
            clearing={clearing}
            onClearHistory={onClearHistory}
            onRecordSelection={onRecordSelection}
            onDeleteHistoryItem={onDeleteHistoryItem}
            onNavigate={onNavigate}
            onSelect={onSelect}
            onClose={onClose}
          />
        </div>
      )}

      {active === "Thông báo" && (
        <div className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Thông báo</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="flex-1 overflow-y-auto">
            <NotificationCenter />
          </div>
        </div>
      )}

      {active === "Hộp thư" && (
        <div className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hộp Thư</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto">
            <NotificationCenter />
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;

