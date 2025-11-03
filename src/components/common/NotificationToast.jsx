import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";
import socketService from "../../services/socket.js";

const NotificationToast = () => {
  useEffect(() => {
    const handleNotification = (data) => {
      const { actor, from, message } = data;
      const msg = message || "Bạn có thông báo mới!";  
      const user = actor || from;
      const username = user?.username;
      const avatar = user?.avatarUrl;
     
      toast.custom(
        (t) => (
          <div
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 
                       shadow-md hover:shadow-lg transition-all duration-300 w-[320px]"
          >
            <img
              src={avatar}
              alt={username}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />

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

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-2xl",
        },
      }}
      closeButton={false}
    />
  );
};

export default NotificationToast;
