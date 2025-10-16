const FOOTER_LINKS = [
  { href: "https://about.meta.com/", label: "Meta", external: true },
  { href: "https://about.instagram.com/", label: "Giới thiệu", external: true },
  { href: "https://about.instagram.com/blog/", label: "Blog", external: true },
  {
    href: "https://about.instagram.com/about-us/careers",
    label: "Việc làm",
    external: true,
  },
  { href: "https://help.instagram.com/", label: "Trợ giúp", external: true },
  {
    href: "https://developers.facebook.com/docs/instagram",
    label: "API",
    external: true,
  },
  { href: "/legal/privacy/", label: "Quyền riêng tư" },
  { href: "/legal/terms/", label: "Điều khoản" },
  { href: "/explore/locations/", label: "Vị trí" },
  { href: "/web/lite/", label: "Instagram Lite" },
  {
    href: "https://www.meta.ai/?utm_source=foa_web_footer",
    label: "Meta AI",
    external: true,
  },
  {
    href: "https://www.meta.ai/pages/best-water-dispensers-for-home-and-office-use/?utm_source=foa_web_footer",
    label: "Bài viết do Meta AI tạo",
    external: true,
  },
  { href: "https://www.threads.com/", label: "Threads", external: true },
  {
    href: "https://www.facebook.com/help/instagram/261704639352628",
    label: "Tải thông tin người liên hệ lên & người không phải người dùng",
    external: true,
  },
  {
    href: "/accounts/meta_verified/?entrypoint=web_footer",
    label: "Meta đã xác minh",
  },
];

const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
];
const Footer = () => {
  return (
    <footer className=" w-full pb-4 text-gray-500 text-xs">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <nav className="flex flex-wrap justify-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex justify-center items-center gap-2">
          <span>Tiếng Việt</span>
          <select
            aria-label="Chuyển ngôn ngữ hiển thị"
            className="border border-gray-300 rounded px-2 py-1 text-xs"
            defaultValue="vi"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-center text-gray-400">
          © 2025 Instagram from Meta
        </div>
      </div>
    </footer>
  );
};
export default Footer;