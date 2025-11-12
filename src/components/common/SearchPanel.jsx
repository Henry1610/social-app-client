import React from "react";
import { X, Loader2 } from "lucide-react";
import { SearchSkeleton } from "./skeletons";

const SearchPanel = ({
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
  onSelect,
  showHeader = true,
  headerTitle = "Tìm kiếm",
  onClose,
  className = "",
  inputClassName = "",
  autoFocus = false,
  hideInput = false,
}) => {
  const handleUserClick = async (user) => {
    try {
      await onRecordSelection({
        type: "user",
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch {}
    onNavigate(`/${encodeURIComponent(user.username)}`);
    if (onSelect) onSelect();
  };

  const handleDeleteHistory = async (userId) => {
    try {
      await onDeleteHistoryItem({
        type: "user",
        id: userId,
      });
    } catch {}
  };

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {!hideInput && (
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring-0 ${inputClassName}`}
            autoFocus={autoFocus}
          />
          {value && (
            <button
              onClick={() => setValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 text-gray-600 hover:text-white"
            >
              {isFetching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
            </button>
          )}
        </div>
      )}

      {!value && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 text-sm mb-2">Gần đây</p>
          <button
            disabled={clearing}
            onClick={onClearHistory}
            className="text-[#4A5DF9] text-sm mb-2 font-semibold disabled:opacity-50"
          >
            Xoá tất cả
          </button>
        </div>
      )}

      <div className="space-y-2">
        {/* Skeleton khi đang tìm kiếm */}
        {isFetching && value && <SearchSkeleton />}

        {/* Kết quả tìm kiếm */}
        {!isFetching &&
          value &&
          (searchData?.users?.length ? (
            searchData.users.map((u) => (
              <SearchResult
                key={u.id}
                name={u.username}
                desc={u.fullName}
                avatar={u.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                onClick={() => handleUserClick(u)}
              />
            ))
          ) : !isFetching && value ? (
            <p className="text-sm text-gray-500">Không có kết quả</p>
          ) : null)}

        {/* Skeleton khi loading lịch sử */}
        {!value && !historyData && <SearchSkeleton />}

        {/* Lịch sử tìm kiếm */}
        {!value &&
          historyData &&
          (historyData?.history?.length ? (
            historyData.history
              .filter((h) => h?.user)
              .map((h, idx) => (
                <HistoryUserItem
                  key={`user-${h.user.id}-${h.t}-${idx}`}
                  user={h.user}
                  onDelete={() => handleDeleteHistory(h.user.id)}
                  onClick={() => handleUserClick(h.user)}
                />
              ))
          ) : (
            <p className="text-sm text-gray-400">
              Chưa có tìm kiếm gần đây
            </p>
          ))}
      </div>
    </div>
  );
};

function SearchResult({ name, desc, avatar, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <img
          src={avatar || `https://i.pravatar.cc/50?u=${name}`}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryUserItem({ user, onClick, onDelete }) {
  return (
    <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg">
      <div
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={onClick}
      >
        <img
          src={user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{user.username}</p>
          {user.fullName ? (
            <p className="text-xs text-gray-500">{user.fullName}</p>
          ) : null}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-gray-400 hover:text-gray-600 p-1"
        aria-label="Xoá"
        title="Xoá"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default SearchPanel;

