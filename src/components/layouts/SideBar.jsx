import React, { useEffect, useState } from "react";
import {
  Home,
  Search,
  Send,
  Heart,
  PlusSquare,
  User,
  Menu,
  X,
} from "lucide-react";
import InstagramLogo1 from "../common/InstagramLogo1";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  useLazySearchUsersQuery,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useRecordSearchSelectionMutation,
  useDeleteSearchHistoryItemMutation,
} from "../../features/Profile/profileApi";
import { NotificationCenter } from "../common/NotificationCenter";
const Sidebar = () => {
  const [active, setActive] = useState(null);
  const [value, setValue] = useState("");

  const [triggerSearch, { data: searchData, isFetching }] =
    useLazySearchUsersQuery();
  const { data: historyData, refetch: refetchHistory } =
    useGetSearchHistoryQuery(
      { page: 1, limit: 10 },
      { skip: active !== "Tìm kiếm" }
    );
  const [clearHistory, { isLoading: clearing }] =
    useClearSearchHistoryMutation();
  const [recordSelection] = useRecordSearchSelectionMutation();
  const [deleteHistoryItem] = useDeleteSearchHistoryItemMutation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isCollapsed = active === "Tìm kiếm" || active === "Thông báo";

  const selfProfilePath =
    currentUser?.username || currentUser?.email
      ? `/${encodeURIComponent(currentUser.username || currentUser.email)}`
      : "/";
  const menuItems = [
    { icon: <Home size={22} />, label: "Trang chủ", path: "/" },
    { icon: <Search size={22} />, label: "Tìm kiếm" },
    { icon: <Send size={22} />, label: "Tin nhắn" },
    { icon: <Heart size={22} />, label: "Thông báo" },
    { icon: <PlusSquare size={22} />, label: "Tạo" },
    { icon: <User size={22} />, label: "Trang cá nhân", path: selfProfilePath },
  ];

  const handleClick = (item) => {
    if (["Tìm kiếm", "Thông báo"].includes(item.label)) {
      setActive(active === item.label ? null : item.label);
    } else {
      setActive(item.label);
      if (item.path) navigate(item.path);
    }
  };

  useEffect(() => {
    if (active === "Tìm kiếm" && refetchHistory) {
      refetchHistory();
    }
  }, [active, refetchHistory]);

  useEffect(() => {
    const q = value.trim();
    if (!q) return;
    const id = setTimeout(() => {
      triggerSearch(q);
    }, 300); // debounce 300ms
    return () => clearTimeout(id);
  }, [value, triggerSearch]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full border-r border-gray-200 p-4 flex flex-col justify-between bg-white z-40 transition-all duration-300 ${
          isCollapsed ? "w-[80px]" : "w-[250px]"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className={`h-[80px] flex items-center transition-all duration-300 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {!isCollapsed ? (
            <InstagramLogo1 className="w-40 h-auto" />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
              alt="Logo nhỏ"
              className="w-8 h-8"
            />
          )}
        </Link>

        {/* Menu items */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-4 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors duration-150 ${
                    active === item.label ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span
                    className={`font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${
                      isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-1"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom menu */}
        <div className="border-t border-gray-200 pt-3">
          <button className="flex items-center gap-4 px-3 py-3 hover:bg-gray-100 rounded-lg w-full">
            <span className="text-lg flex-shrink-0">
              <Menu size={22} />
            </span>

            <span
              className={`text-[15px] font-medium text-gray-800 whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              Thêm
            </span>
          </button>
        </div>
      </aside>

      {/* Search Panel */}
      <div
        className={`fixed top-0 left-[80px] h-full bg-white border-r shadow-xl transition-all duration-300 z-30 ${
          ["Tìm kiếm", "Thông báo"].includes(active)
            ? "w-[400px] opacity-100 translate-x-0"
            : "w-0 opacity-0 -translate-x-5 overflow-hidden"
        }`}
      >
        {active === "Tìm kiếm" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tìm kiếm</h2>
              <button
                onClick={() => setActive(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring"
              />
              {value && (
                <button
                  onClick={() => setValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 text-gray-600 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm mb-2">Gần đây</p>
              <button
                disabled={clearing}
                onClick={async () => {
                  try {
                    await clearHistory().unwrap();
                    await refetchHistory();
                  } catch {}
                }}
                className="text-[#4A5DF9] text-sm mb-2 font-semibold disabled:opacity-50"
              >
                Xoá tất cả
              </button>
            </div>
            <div className="space-y-2">
              {isFetching && (
                <p className="text-sm text-gray-500">Đang tìm...</p>
              )}
              {!isFetching &&
                value &&
                (searchData?.users?.length ? (
                  searchData.users.map((u) => (
                    <SearchResult
                      key={u.id}
                      name={u.username}
                      desc={u.fullName}
                      avatar={u.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
                      onClick={async () => {
                        try {
                          await recordSelection({
                            type: "user",
                            user: {
                              id: u.id,
                              username: u.username,
                              fullName: u.fullName,
                              avatarUrl: u.avatarUrl,
                            },
                          }).unwrap();
                        } catch {}
                        navigate(`/${encodeURIComponent(u.username)}`);
                        setActive(null);
                        setValue("");
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Không có kết quả</p>
                ))}

              {/* Show only user history entries */}
              {!value &&
                (historyData?.history?.length ? (
                  historyData.history
                    .filter((h) => h?.user)
                    .map((h, idx) => (
                      <HistoryUserItem
                        key={`user-${h.user.id}-${h.t}-${idx}`}
                        user={h.user}
                        onDelete={async () => {
                          try {
                            await deleteHistoryItem({
                              type: "user",
                              id: h.user.id,
                            }).unwrap();
                            await refetchHistory();
                          } catch {}
                        }}
                        onClick={async () => {
                          try {
                            await recordSelection({
                              type: "user",
                              user: {
                                id: h.user.id,
                                username: h.user.username,
                                fullName: h.user.fullName,
                                avatarUrl: h.user.avatarUrl,
                              },
                            }).unwrap();
                            await refetchHistory();
                          } catch {}
                          navigate(`/${encodeURIComponent(h.user.username)}`);
                          setActive(null);
                          setValue("");
                        }}
                      />
                    ))
                ) : (
                  <p className="text-sm text-gray-400">
                    Chưa có tìm kiếm gần đây
                  </p>
                ))}
            </div>
          </div>
        )}
        {active === "Thông báo" && (
  <div className="p-5 h-full flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">Thông báo</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActive(null)}
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

      </div>
    </>
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
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">×</button>
    </div>
  );
}

function HistoryUserItem({ user, onClick, onDelete }) {
  return (
    <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
        <img
          src={user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{user.username}</p>
          {user.fullName ? (
            <p className="text-xs text-gray-500">{user.fullName}</p>
          ) : null}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-gray-600 p-1"
        aria-label="Xoá"
        title="Xoá"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Sidebar;
