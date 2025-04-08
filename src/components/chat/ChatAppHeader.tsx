
import React from 'react';
import { Bell, History, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatAppHeaderProps {
  unreadCount: number;
  onOpenInbox: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
}

const ChatAppHeader: React.FC<ChatAppHeaderProps> = ({
  unreadCount,
  onOpenInbox,
  onOpenHistory,
  onLogout,
}) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 flex justify-between items-center">
      <div className="flex-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Chat App</h1>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onOpenInbox}
          className="relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onOpenHistory}
        >
          <History size={20} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onLogout}
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
};

export default ChatAppHeader;
