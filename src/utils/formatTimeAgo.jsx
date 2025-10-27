// Hàm định dạng thời gian giống Instagram
export function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
  
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
  
    // Nếu quá 7 ngày thì hiển thị ngày/tháng/năm cụ thể
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

// Hàm định dạng thời gian offline
export function formatOfflineTime(lastSeen) {
    if (!lastSeen) return "Không rõ";
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
  
    if (diffMin < 1) return "Vừa online";
    if (diffMin < 60) return `Offline ${diffMin} phút trước`;
    if (diffHour < 24) return `Offline ${diffHour} giờ trước`;
    if (diffDay < 7) return `Offline ${diffDay} ngày trước`;
  
    // Nếu quá 7 ngày thì hiển thị ngày/tháng/năm cụ thể
    return `Offline ${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  }
  