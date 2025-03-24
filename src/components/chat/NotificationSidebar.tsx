
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  senderId?: string; // Added senderId to link notifications to users
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  type: 'inbox' | 'history';
  onClickNotification?: (senderId: string) => void; // Added new prop for handling clicks
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

  // Handle clicking outside the sidebar
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add the event listener with a small delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationRead(notification.id);
    
    // Open the conversation if senderId is provided and we have a click handler
    if (notification.senderId && onClickNotification) {
      onClickNotification(notification.senderId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        ref={sidebarRef}
        className="absolute right-0 h-full w-80 bg-white shadow-xl flex flex-col animate-in slide-in-from-right"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {type === 'inbox' ? 'Inbox' : 'History'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No {type === 'inbox' ? 'messages' : 'history'} to display
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
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
