import React, { useState } from "react";
import {
  Home,
  Search,
  Plus,
  Send,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import CreatePostModal from "../../features/post/components/CreatePostModal";

const BottomNavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const selfProfilePath =
    currentUser?.username || currentUser?.email
      ? `/${encodeURIComponent(currentUser.username || currentUser.email)}`
      : "/";

  const menuItems = [
    { 
      icon: Home, 
      label: "Trang chủ", 
      path: "/",
      isActive: location.pathname === "/"
    },
    { 
      icon: Search, 
      label: "Tìm kiếm", 
      path: "/search"
    },
    { 
      icon: Plus, 
      label: "Tạo",
      isButton: true
    },
    { 
      icon: Send, 
      label: "Tin nhắn", 
      path: "/chat"
    },
    { 
      icon: User, 
      label: "Trang cá nhân", 
      path: selfProfilePath,
      isProfile: true
    },
  ];

  const handleClick = (item) => {
    if (item.isButton && item.label === "Tạo") {
      setShowCreatePostModal(true);
      return;
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    if (item.isActive !== undefined) return item.isActive;
    if (item.path) {
      if (item.path === "/chat") {
        return location.pathname.startsWith("/chat");
      }
      if (item.path === "/search") {
        return location.pathname === "/search";
      }
      return location.pathname === item.path;
    }
    return false;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex items-center justify-around h-14 px-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <button
                key={index}
                onClick={() => handleClick(item)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active ? "text-black" : "text-gray-600"
                }`}
                aria-label={item.label}
              >
                {item.isProfile ? (
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${
                      active
                        ? "border-black"
                        : "border-gray-300 bg-gray-200"
                    }`}
                  >
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : null}
                  </div>
                ) : (
                  <Icon
                    size={24}
                    fill={active && item.label === "Trang chủ" ? "currentColor" : "none"}
                    strokeWidth={active ? 2.5 : 2}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />
    </>
  );
};

export default BottomNavigationBar;

