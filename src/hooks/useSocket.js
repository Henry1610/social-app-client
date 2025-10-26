import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socket.js';

export const useSocket = (userId, token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId && token) {
      const socketInstance = socketService.connect(userId, token);
      setSocket(socketInstance);

      // Listen for connection events
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socketService.on('connection:established', handleConnect);
      socketService.on('connection:lost', handleDisconnect);

      return () => {
        socketService.off('connection:established', handleConnect);
        socketService.off('connection:lost', handleDisconnect);
      };
    }
  }, [userId, token]);



  const markNotificationAsRead = useCallback((notificationId) => {
    socketService.markNotificationAsRead(notificationId, userId);
  }, [userId]);

  const markAllNotificationsAsRead = useCallback(() => {
    socketService.markAllNotificationsAsRead(userId);
  }, [userId]);

  return {
    socket,
    isConnected,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    socketService,
  };
};

export default useSocket;
