
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Notification } from '@/types/chat';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  type: 'inbox' | 'history';
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationRead,
  type
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { selectUser, onlineUsers } = useChat();

  // Handle clicking outside the sidebar
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add the event listener immediately
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Helper to get proper bot name from ID
  const getBotNameById = (botId: string): string => {
    const bot = onlineUsers.find(user => user.id === botId);
    return bot ? bot.name : 'Unknown';
  };

  // Handle notification click - open conversation with that user
  const handleNotificationClick = (notification: Notification) => {
    onNotificationRead(notification.id);
    
    if (notification.botId) {
      // Find the bot by ID and select them
      const bot = onlineUsers.find(user => user.id === notification.botId);
      if (bot) {
        selectUser(bot);
        onClose(); // Close sidebar after selecting
      }
    } else if (type === 'inbox') {
      // Try to find bot by name in title for inbox
      const senderName = notification.title.replace('New message from ', '');
      const bot = onlineUsers.find(user => user.name === senderName);
      if (bot) {
        selectUser(bot);
        onClose(); // Close sidebar after selecting
      }
    } else if (type === 'history') {
      // For history items, parse the title to find the bot name
      const pattern = /^(Message to|Image sent to|Voice message sent to) (.+)$/;
      const match = notification.title.match(pattern);
      
      if (match && match[2]) {
        const recipientName = match[2];
        const bot = onlineUsers.find(user => user.name === recipientName);
        if (bot) {
          selectUser(bot);
          onClose(); // Close sidebar after selecting
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        ref={sidebarRef}
        className="absolute right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl flex flex-col animate-in slide-in-from-right"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-lg dark:text-gray-200">
            {type === 'inbox' ? 'Inbox' : 'History'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              No {type === 'inbox' ? 'messages' : 'history'} to display
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                // Fix to show correct bot name in notification
                let displayTitle = notification.title;
                
                if (type === 'inbox' && notification.botId && displayTitle.includes('New message from')) {
                  const botName = getBotNameById(notification.botId);
                  displayTitle = `New message from ${botName}`;
                }
                
                return (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm dark:text-gray-200">{displayTitle}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar;
