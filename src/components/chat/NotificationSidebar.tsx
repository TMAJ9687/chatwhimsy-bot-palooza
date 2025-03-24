
import React, { useEffect, useRef } from 'react';
import { Bell, Clock, X } from 'lucide-react';

export interface Notification {
  id: string;
  senderId?: string;
  senderName?: string;
  title: string;
  message: string;
  timestamp: Date;
  time?: Date;
  read: boolean;
  type?: 'message' | 'system' | 'image';
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  type: 'inbox' | 'history';
  onClickNotification: (senderId: string) => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationRead,
  type,
  onClickNotification
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/10">
      <div 
        ref={sidebarRef}
        className="w-80 md:w-96 h-full bg-white dark:bg-gray-800 shadow-lg flex flex-col animate-in slide-in-from-right"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {type === 'inbox' ? (
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
            <h2 className="font-semibold text-lg">
              {type === 'inbox' ? 'Notifications' : 'Chat History'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                {type === 'inbox' ? (
                  <Bell className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Clock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {type === 'inbox' 
                  ? 'No new notifications' 
                  : 'Your chat history will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700' 
                      : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                  }`}
                  onClick={() => {
                    onNotificationRead(notification.id);
                    onClickNotification(notification.senderId);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.senderName}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar;
