import React, { useEffect, useState } from "react";
import {
  Home,
  Search,
  Send,
  Heart,
  PlusSquare,
  User,
  LogOut,
} from "lucide-react";
import InstagramLogo1 from "../common/InstagramLogo1";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  useLazySearchUsersQuery,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useRecordSearchSelectionMutation,
  useDeleteSearchHistoryItemMutation,
} from "../../features/search/api/searchApi";
import useLogout from "../../features/auth/hooks/useLogout";
import CreatePostModal from "../../features/post/components/CreatePostModal";
import SidePanel from "./SidePanel";

const Sidebar = () => {
  const [active, setActive] = useState(null);
  const [value, setValue] = useState("");
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const handleLogout = useLogout();

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
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const isCollapsed =
    active === "Tìm kiếm" ||
    active === "Thông báo" ||
    location.pathname.startsWith("/chat");

  const selfProfilePath =
    currentUser?.username || currentUser?.email
      ? `/${encodeURIComponent(currentUser.username || currentUser.email)}`
      : "/";
  const menuItems = [
    { icon: <Home size={22} />, label: "Trang chủ", path: "/" },
    { icon: <Search size={22} />, label: "Tìm kiếm" },
    { icon: <Send size={22} />, label: "Tin nhắn", path: "/chat" },
    { icon: <Heart size={22} />, label: "Thông báo" },
    { icon: <PlusSquare size={22} />, label: "Tạo" },
    { icon: <User size={22} />, label: "Trang cá nhân", path: selfProfilePath },
  ];

  const handleClick = (item) => {
    if (item.label === "Tạo") {
      setShowCreatePostModal(true);
      return;
    }
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

  // Listen for custom event to open notifications (from HomeHeader on desktop)
  useEffect(() => {
    const handleOpenNotifications = () => {
      setActive("Thông báo");
    };
    window.addEventListener("openNotifications", handleOpenNotifications);
    return () => window.removeEventListener("openNotifications", handleOpenNotifications);
  }, []);

  return (
    <>
      {/* Sidebar */}
      <aside
        className="main-sidebar fixed left-0 top-0 h-full border-r border-gray-200 p-4 flex flex-col justify-between bg-white z-40 transition-all duration-300"
        style={{
          width: isCollapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          "--sidebar-current-width": isCollapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center transition-all duration-300 ${
            isCollapsed ? "justify-center" : ""
          } h-[60px] sm:h-[70px] md:h-[80px]`}
        >
          {!isCollapsed ? (
            <InstagramLogo1 className="w-32 sm:w-36 md:w-40 h-auto" />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
              alt="Logo nhỏ"
              className="w-7 sm:w-8 h-auto"
            />
          )}
        </Link>

        {/* Menu items */}
        <nav className="flex-1 mb-2">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-4 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors duration-150 justify-center md:justify-start ${
                    active === item.label ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="text-lg flex-shrink-0 text-center">{item.icon}</span>
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 hover:bg-gray-100 rounded-lg w-full transition-colors duration-150"
          >
            <span className="text-lg flex-shrink-0">
              <LogOut size={22} />
            </span>

            <span
              className={`text-[15px] font-medium text-gray-800 whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>

      {/* Side Panel */}
      <SidePanel
        active={active}
        value={value}
        setValue={setValue}
        isFetching={isFetching}
        searchData={searchData}
        historyData={historyData}
        clearing={clearing}
        onClearHistory={async () => {
          try {
            await clearHistory().unwrap();
            await refetchHistory();
          } catch {}
        }}
        onRecordSelection={async (data) => {
          try {
            await recordSelection(data).unwrap();
            if (active === "Tìm kiếm") {
              await refetchHistory();
            }
          } catch {}
        }}
        onDeleteHistoryItem={async (data) => {
          try {
            await deleteHistoryItem(data).unwrap();
            await refetchHistory();
          } catch {}
        }}
        onNavigate={(path) => navigate(path)}
        onClose={() => {
          setActive(null);
          setValue("");
        }}
        onSelect={() => {
          setActive(null);
          setValue("");
        }}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />
    </>
  );
};

export default Sidebar;
