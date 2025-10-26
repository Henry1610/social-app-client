import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";
import socketService from "../../services/socket.js";
import { Heart, MessageCircle, UserPlus, Repeat2, Bell } from "lucide-react";

const NotificationToast = () => {
  useEffect(() => {
    const handleNotification = (data) => {

      const { type, from, message } = data;
      const msg = message || "Bạn có thông báo mới!";  
      const username = from?.username || "Người dùng";
      const avatar = from?.avatarUrl || "/default-avatar.png";
     
      toast.custom(
        () => (
          <div
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 
                       shadow-md hover:shadow-lg transition-all duration-300 w-[320px]"
          >
            {/* Avatar + icon */}
            <div className="relative flex-shrink-0">
              <img
                src={avatar}
                alt={username}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="absolute bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                {getIcon(type)}
              </div>
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {username}
              </p>
              <p className="text-sm text-gray-600 truncate">{msg}</p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    };

    socketService.on("notification:received", handleNotification);
    return () => socketService.off("notification:received", handleNotification);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "FOLLOW":
        return <UserPlus  size={18} />;
      case "LIKE":
        return <Heart  size={18} />;
      case "COMMENT":
        return <MessageCircle  size={18} />;
      case "REPOST":
        return <Repeat2  size={18} />;
      default:
        return ;
    }
  };

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-2xl",
        },
      }}
    />
  );
};

export default NotificationToast;
