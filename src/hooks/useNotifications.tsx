
import { useState, useCallback, useMemo } from 'react';
import { Notification } from '@/types/chat';

export const useNotifications = () => {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<Notification[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleNotificationRead = useCallback((id: string) => {
    setUnreadNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setUnreadNotifications(prev => [notification, ...prev]);
  }, []);

  const addHistoryItem = useCallback((notification: Notification) => {
    setChatHistory(prev => [notification, ...prev]);
  }, []);

  const unreadCount = useMemo(() => 
    unreadNotifications.filter(n => !n.read).length, 
    [unreadNotifications]
  );

  return {
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    unreadCount,
    setShowInbox,
    setShowHistory,
    handleNotificationRead,
    addNotification,
    addHistoryItem
  };
};
