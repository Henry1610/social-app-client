import React, { useState, useEffect } from "react";
import { ArrowLeft, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useLazySearchUsersQuery,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useRecordSearchSelectionMutation,
  useDeleteSearchHistoryItemMutation,
} from "../../features/search/api/searchApi";
import SearchPanel from "../../features/search/components/SearchPanel";

const Search = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [triggerSearch, { data: searchData, isFetching }] =
    useLazySearchUsersQuery();
  const { data: historyData, refetch: refetchHistory } =
    useGetSearchHistoryQuery({ page: 1, limit: 10 });
  const [clearHistory, { isLoading: clearing }] =
    useClearSearchHistoryMutation();
  const [recordSelection] = useRecordSearchSelectionMutation();
  const [deleteHistoryItem] = useDeleteSearchHistoryItemMutation();

  useEffect(() => {
    if (value.trim()) {
      const id = setTimeout(() => {
        triggerSearch(value.trim());
      }, 300); // debounce 300ms
      return () => clearTimeout(id);
    }
  }, [value, triggerSearch]);

  const handleClearHistory = async () => {
    try {
      await clearHistory().unwrap();
      await refetchHistory();
    } catch {}
  };

  const handleDeleteHistoryItem = async (userId) => {
    try {
      await deleteHistoryItem({
        type: "user",
        id: userId,
      });
      await refetchHistory();
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 bg-white md:hidden overflow-y-auto z-50"
      style={{ width: "100vw", left: 0, right: 0, marginLeft: 0 }}
    >
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-1 mr-3"
            aria-label="Quay lại"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold">Tìm kiếm</h1>
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring-0"
            autoFocus
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
      </div>

      {/* Content */}
      <div className="pb-20 w-full px-4 py-3">
        <SearchPanel
          value={value}
          setValue={setValue}
          isFetching={isFetching}
          searchData={searchData}
          historyData={historyData}
          clearing={clearing}
          onClearHistory={handleClearHistory}
          onRecordSelection={recordSelection}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onNavigate={navigate}
          showHeader={false}
          hideInput={true}
          className="mb-0"
        />
      </div>
    </div>
  );
};

export default Search;
