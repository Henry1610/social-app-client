import React, { useState, useEffect } from "react";
import { Plus, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InstagramLogo1 from "../common/InstagramLogo1";
import CreatePostModal from "../../features/post/components/CreatePostModal";
import { useGetNotificationsQuery } from "../../features/notification/api/notificationApi";

const HomeHeader = () => {
  const navigate = useNavigate();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get unread notifications count
  const { data: notificationsData } = useGetNotificationsQuery({ page: 1, limit: 20 });
  const notifications = notificationsData?.data?.notifications || [];
  // Check if there are unread notifications (isRead === false or undefined)
  const hasUnread = notifications.some(n => n.isRead === false || n.isRead === undefined);

  const handleNotificationClick = () => {
    if (isMobile) {
      // Mobile: redirect to notifications page
      navigate("/notifications");
    } else {
      // Desktop: open SidePanel (handled by SideBar component)
      // We'll trigger it by setting active state in SideBar
      // For now, we can use a custom event or navigate to a special route
      // Actually, SideBar handles this internally, so we might need to trigger it differently
      // Let's use a custom event that SideBar can listen to
      window.dispatchEvent(new CustomEvent("openNotifications"));
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo Instagram */}
          <div className="flex items-center">
            <InstagramLogo1 className="h-6" />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="p-1"
              aria-label="Tạo bài viết"
            >
              <Plus size={24} className="text-gray-900" strokeWidth={2} />
            </button>

            {/* Notifications Button */}
            <button
              onClick={handleNotificationClick}
              className="relative p-1"
              aria-label="Thông báo"
            >
              <Heart size={24} className="text-gray-900" strokeWidth={2} fill="none" />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />
    </>
  );
};

export default HomeHeader;

