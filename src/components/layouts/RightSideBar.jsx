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
  return (
    <aside className="w-80 pl-10 py-10 hidden lg:block">
      {/* User Profile */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300" />
          <div>
            <p className="font-semibold text-sm">wynot_henry</p>
            <p className="text-gray-500 text-xs">Nguyễn Trường</p>
          </div>
        </div>
        <button className="text-blue-500 text-xs font-semibold">Chuyển</button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-2 px-4 py-1">
        <span className="text-gray-500 text-sm font-semibold">
          Gợi ý cho bạn
        </span>
        <button className="text-xs font-semibold">Xem tất cả</button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-1 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
              <div>
                <p className="font-semibold text-sm">user{i}</p>
                <p className="text-gray-500 text-xs">Gợi ý cho bạn</p>
              </div>
            </div>
            <button className="text-blue-500 text-xs font-semibold">
              Theo dõi
            </button>
          </div>
        ))}
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
