import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetFollowSuggestionsQuery } from "../../features/profile/api/profileApi.js";
import FollowButton from "../common/FollowButton";

const links = [
  { label: "Giới thiệu", href: "https://about.instagram.com/", external: true },
  { label: "Trợ giúp", href: "https://help.instagram.com/", external: true },
  {
    label: "Báo chí",
    href: "https://about.instagram.com/blog/",
    external: true,
  },
  {
    label: "API",
    href: "https://developers.facebook.com/docs/instagram",
    external: true,
  },
  {
    label: "Việc làm",
    href: "https://about.instagram.com/about-us/careers",
    external: true,
  },
  { label: "Quyền riêng tư", href: "/legal/privacy/", external: false },
  { label: "Điều khoản", href: "/legal/terms/", external: false },
  { label: "Vị trí", href: "/explore/locations/", external: false },
  { label: "Ngôn ngữ", isButton: true },
  {
    label: "Meta đã xác minh",
    href: "/accounts/meta_verified/?entrypoint=web_footer",
    external: false,
  },
];

function RightSidebar() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { data: suggestionsData, isLoading: loadingSuggestions } = useGetFollowSuggestionsQuery();
  
  const suggestions = suggestionsData?.suggestions || [];
  const displayedSuggestions = suggestions.slice(0, 5); // Chỉ hiển thị 5 suggestions đầu tiên

  const handleUserClick = (username) => {
    navigate(`/${username}`);
  };

  return (
    <aside className="w-80 pl-10 py-8 hidden lg:block">
      {/* User Profile */}
      {currentUser && (
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleUserClick(currentUser.username)}
          >
            <img 
              src={currentUser.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"} 
              alt={currentUser.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{currentUser.username}</p>
              <p className="text-gray-500 text-xs">{currentUser.fullName || ""}</p>
            </div>
          </div>
          <button 
            className="text-blue-500 text-xs font-semibold hover:text-blue-600"
            onClick={() => navigate(`/${currentUser.username}`)}
          >
            Chuyển
          </button>
        </div>
      )}

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-2 px-4 py-1">
        <span className="text-gray-500 text-sm font-semibold">
          Gợi ý cho bạn
        </span>
      </div>

      {/* Suggestions List */}
      <div className="space-y-1 mb-6">
        {loadingSuggestions ? (
          <div className="px-4 py-2 text-gray-500 text-sm">Đang tải...</div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-2 text-gray-500 text-sm text-center font-semibold">Không có gợi ý nào</div>
        ) : (
            displayedSuggestions.map((user) => (
             <div key={user.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-150">
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => handleUserClick(user.username)}
              >
                <img 
                  src={user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.username}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {user.fullName || "Gợi ý cho bạn"}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton
                  viewingUsername={user.username}
                  isChatButtonVisible={false}
                  size="small"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="text-xs text-gray-400 space-y-2 pl-4">
        <div className="flex flex-wrap gap-1 items-center">
          {links.map((item, idx) => {
            const separator = idx < links.length - 1 && (
              <span aria-hidden="true"> •</span>
            );

            if (item.isButton) {
              return (
                <div key={item.label} className="flex items-center">
                  <button
                    type="button"
                    className="hover:underline text-gray-400 bg-transparent p-0 border-0 cursor-pointer"
                  >
                    {item.label}
                  </button>
                  {separator}
                </div>
              );
            }

            return (
              <div key={item.label} className="flex items-center">
                <a
                  href={item.href}
                  className="hover:underline text-gray-400"
                  {...(item.external && {
                    target: "_blank",
                    rel: "nofollow noopener noreferrer",
                  })}
                >
                  {item.label}
                </a>
                {separator}
              </div>
            );
          })}
        </div>
        <p>© 2025 INSTAGRAM FROM META</p>
      </footer>
    </aside>
  );
}

export default RightSidebar;
