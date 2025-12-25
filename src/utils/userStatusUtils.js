/**
 * Kiểm tra xem user có đang online không dựa trên isOnline và lastSeen
 * User được coi là online nếu:
 * - isOnline = true VÀ
 * - lastSeen trong vòng 5 phút gần đây (nếu có lastSeen)
 * 
 * @param {Object} user - User object hoặc socket data với isOnline và lastSeen (optional)
 * @returns {boolean} - true nếu user online, false nếu offline
 */
export const isUserActuallyOnline = (user) => {
  if (!user?.isOnline) return false;
  
  // Nếu không có lastSeen, chỉ dựa vào isOnline
  if (!user?.lastSeen) return user.isOnline;
  
  // Nếu có lastSeen, kiểm tra trong vòng 5 phút
  const lastSeenDate = new Date(user.lastSeen);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
  
  return diffMinutes <= 5;
};

