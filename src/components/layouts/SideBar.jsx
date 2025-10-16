import React, { useState } from "react";
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

const Sidebar = () => {
  const [active, setActive] = useState(null);
  const [value, setValue] = useState("");

  const isCollapsed = active === "Tìm kiếm";

  const menuItems = [
    { icon: <Home size={22} />, label: "Trang chủ" },
    { icon: <Search size={22} />, label: "Tìm kiếm" },
    { icon: <Send size={22} />, label: "Tin nhắn" },
    { icon: <Heart size={22} />, label: "Thông báo" },
    { icon: <PlusSquare size={22} />, label: "Tạo" },
    { icon: <User size={22} />, label: "Trang cá nhân" },
  ];

  const handleClick = (label) => {
    setActive(active === label ? null : label);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full border-r border-gray-200 p-4 flex flex-col justify-between bg-white z-40 transition-all duration-300 ${
          isCollapsed ? "w-[80px]" : "w-[250px]"
        }`}
      >
        {/* Logo */}
        <div className="mb-6 pt-4 transition-all duration-300">
          {!isCollapsed ? (
            <InstagramLogo1 className="w-40 h-auto mt-3" />
          ) : (
            <div className="flex justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                alt="Logo nhỏ"
                className="w-8 h-8"
              />
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleClick(item.label)}
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
            <Menu size={22} />
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
        className={`absolute top-0 left-[80px] h-full bg-white border-r shadow-xl transition-all duration-300 z-30 ${
          active === "Tìm kiếm"
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
              <p className="text-[#4A5DF9]  text-sm mb-2 font-semibold">
                Xoá tất cả
              </p>
            </div>
            <div className="space-y-2">
              <SearchResult name="katie_102" desc="Thanh Trang" />
              <SearchResult name="_fxs205" desc="Như Quỳnh" />
              <SearchResult name="tz_hao24" desc="N.PhươngThảo" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function SearchResult({ name, desc }) {
  return (
    <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
      <div className="flex items-center gap-3">
        <img
          src={`https://i.pravatar.cc/50?u=${name}`}
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

export default Sidebar;
