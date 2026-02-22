import { useState, useEffect } from 'react';
import { getSocket } from '@/socket/socket';

export const useOnlineStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Get initial online users list when we connect
    const handleOnlineUsers = (res: { success: boolean; data: string[] }) => {
      if (res.success) {
        setOnlineUsers(new Set(res.data));
        console.log('[Online] Initial online users:', res.data.length);
        console.log('[Online] User IDs:', res.data);
      }
    };

    // Someone came online
    const handleUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      console.log('[Online] User came online:', userId);
    };

    // Someone went offline
    const handleUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      console.log('[Online] User went offline:', userId);
    };

    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, []);

  const isOnline = (userId: string): boolean => onlineUsers.has(userId);

  return { onlineUsers, isOnline };
};
