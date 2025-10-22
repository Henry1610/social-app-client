import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
} from "../../features/Profile/profileApi";
import { toast } from "sonner";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import NotificationSkeleton from "./NotificationSkeleton";

export const NotificationCenter = () => {
  const navigate = useNavigate();

  const {
    data: notificationsData,
    error,
    isLoading,
  } = useGetNotificationsQuery({ page: 1, limit: 20 });

  const notifications = notificationsData?.data?.notifications || [];

  useEffect(() => {
    if (error) {
      toast.error("Không thể tải danh sách thông báo!");
      console.error(error);
    }
  }, [error]);

  //  Click vào thông báo
  const handleNotificationClick = (n) => {
    if (
      [
        "FOLLOW",
        "FOLLOW_REQUEST",
        "FOLLOW_ACCEPTED",
        "FOLLOW_REJECTED",
      ].includes(n.type)
    ) {
      const username = n.metadata?.lastActorName?.username;
      if (username) navigate(`/${username}`);
    }
  };


  //  Khi đang load thông báo
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <p className="text-sm">Chưa có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((n, index) => (
        <div
          key={`${n.id}-${n.createdAt}-${index}`}
          onClick={() => handleNotificationClick(n)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all cursor-pointer"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={n.metadata?.lastActorName?.avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          {/* Nội dung */}
          <div className="flex-1 text-sm text-gray-800">
            <p>{n.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTimeAgo(n.updatedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
