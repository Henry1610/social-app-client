import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../auth/authSlice";
import {
  useGetNotificationsQuery,
} from "../api/notificationApi";
import { toast } from "sonner";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import { NotificationSkeleton } from "../../../components/common/skeletons";

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

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

  // Xử lý click vào thông báo
  const handleNotificationClick = (n) => {
    // Thông báo follow - đi đến profile của người đó
    if (
      [
        "FOLLOW",
        "FOLLOW_REQUEST",
        "FOLLOW_ACCEPTED",
        "FOLLOW_REJECTED",
      ].includes(n.type)
    ) {
      const actor = n.actor || n.metadata?.lastActorName;
      const username = actor?.username;
      if (username) {
        navigate(`/${username}`);
      }
    } 
    // Thông báo comment/like/repost - mở post modal
    else if (["COMMENT", "REACTION", "REPOST"].includes(n.type) && n.targetId && n.targetType === "POST") {
      // Navigate đến profile hiện tại với postId, Profile component sẽ tự mở modal
      const currentUsername = currentUser?.username;
      if (currentUsername) {
        navigate(`/${currentUsername}?postId=${n.targetId}`);
      }
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
    <div className="pr-2 py-1">
      {notifications.map((n, index) => {
        const actor = n.actor || n.metadata?.lastActorName;
        const avatarUrl = actor?.avatarUrl ;
        const username = actor?.username;
        
        return (
          <div
            key={`${n.id}-${n.createdAt}-${index}`}
            onClick={() => handleNotificationClick(n)}
            className="flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={username }
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
        );
      })}
    </div>
  );
};
