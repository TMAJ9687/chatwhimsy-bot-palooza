
import React, { memo } from 'react';
import { LogOut, Clock, Bell } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import { Notification } from './NotificationSidebar';

interface ChatAppHeaderProps {
  unreadCount: number;
  onOpenInbox: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
}

const ChatAppHeader = ({
  unreadCount,
  onOpenInbox,
  onOpenHistory,
  onLogout
}: ChatAppHeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-900 py-2 px-4 border-b border-border flex items-center justify-end">
      <div className="flex items-center gap-5">
        <button 
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          onClick={onOpenInbox}
        >
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onOpenHistory}
        >
          <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <ThemeToggle />
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 text-red-500" />
        </button>
      </div>
    </header>
  );
};

export default memo(ChatAppHeader);
