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
import { RefreshCw } from "lucide-react";
import { useChat } from "../../../contexts/ChatContext";

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { openChat } = useChat();

  const {
    data: notificationsData,
    error,
    isLoading,
    refetch,
    isFetching,
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
    else if (["COMMENT", "REACTION", "REPOST"].includes(n.type) && n.targetId) {
      // Xử lý notification cho reaction message - redirect đến conversation
      if (n.type === "REACTION" && n.targetType === "MESSAGE") {
        const conversationId = n.metadata?.conversationId;
        if (conversationId) {
          openChat({ conversationId: conversationId });
        }
        return;
      }
      
      const currentUsername = currentUser?.username;
      if (currentUsername) {
        // Xử lý notification cho repost
        if (n.targetType === "REPOST") {
          const repostId = n.targetId || n.metadata?.repostId;
          if (repostId) {
            navigate(`/${currentUsername}?repostId=${repostId}`);
          }
        } 
        // Xử lý notification cho post
        else if (n.targetType === "POST") {
          navigate(`/${currentUsername}?postId=${n.targetId}`);
        }
      }
    }
    // Thông báo reply comment - mở post modal với commentId
    else if (n.type === "REPLY" && n.targetId && n.targetType === "COMMENT") {
      const currentUsername = currentUser?.username;      
      if (currentUsername) {
        // Lấy postId hoặc repostId từ metadata
        const postId = n.metadata?.postId;
        const repostId = n.metadata?.repostId;
        const commentId = n.targetId;
        
        if (postId) {
          // Navigate đến post với commentId trong query để highlight comment          
          navigate(`/${currentUsername}?postId=${postId}&commentId=${commentId}`);
        } else if (repostId) {
          console.log(postId, commentId);

          // Navigate đến repost với commentId trong query
          navigate(`/${currentUsername}?repostId=${repostId}&commentId=${commentId}`);
        }
      }
    }
  };


  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới danh sách thông báo");
    } catch (error) {
      toast.error("Không thể làm mới danh sách thông báo");
    }
  };

  //  Khi đang load thông báo
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-10 text-gray-400">
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw
            size={18}
            className={`text-gray-600 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
        <p className="text-sm">Chưa có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="relative pr-2 py-1">
      {/* Nút reload ở góc trên bên phải */}
      <button
        onClick={handleRefresh}
        disabled={isFetching}
        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 z-10 "
        title="Làm mới"
      >
        <RefreshCw
          size={18}
          className={`text-gray-600 ${isFetching ? "animate-spin" : ""}`}
        />
      </button>
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
