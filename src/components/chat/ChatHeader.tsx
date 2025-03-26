
import React, { memo, useCallback } from 'react';
import { X, MoreVertical, UserX2, Flag } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useDialog } from '@/context/DialogContext';
import { useChat } from '@/context/ChatContext';

interface ChatHeaderProps {
  currentUser: {
    id: string;
    name: string;
    age: number;
    gender: string;
    country: string;
    countryCode: string;
    vip: boolean;
  };
  onBlockUser: (userId: string) => void;
  onCloseChat: () => void;
}

// Optimized component with memoization
const ChatHeader: React.FC<ChatHeaderProps> = memo(({ 
  currentUser, 
  onBlockUser, 
  onCloseChat 
}) => {
  const { openDialog } = useDialog();
  const { isUserBlocked, handleUnblockUser } = useChat();
  
  // Check if current user is blocked
  const isBlocked = isUserBlocked(currentUser.id);
  
  // Use animation frame to prevent UI freeze when opening dialogs
  const handleOpenReportDialog = useCallback(() => {
    requestAnimationFrame(() => {
      openDialog('report', { 
        userName: currentUser.name,
        userId: currentUser.id
      });
    });
  }, [openDialog, currentUser.name, currentUser.id]);

  const handleOpenBlockDialog = useCallback(() => {
    requestAnimationFrame(() => {
      openDialog('block', { 
        userName: currentUser.name,
        userId: currentUser.id, 
        onBlockUser: onBlockUser
      });
    });
  }, [openDialog, currentUser.name, currentUser.id, onBlockUser]);

  const handleUnblock = useCallback(() => {
    handleUnblockUser(currentUser.id);
  }, [handleUnblockUser, currentUser.id]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-500 dark:text-amber-400 mr-3">
          {currentUser.name.charAt(0)}
        </div>
        
        <div>
          <div className="flex items-center">
            <span className="font-medium dark:text-gray-200">{currentUser.name}</span>
            {currentUser.vip && (
              <span className="ml-2 bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                <span>VIP</span>
              </span>
            )}
            <span className={`ml-2 text-xs ${currentUser.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
              {currentUser.gender === 'female' ? 'F' : 'M'}, {currentUser.age}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <img 
              src={`https://flagcdn.com/w20/${currentUser.countryCode.toLowerCase()}.png`} 
              alt={currentUser.country}
              className="w-4 h-3 mr-1"
            />
            <span>{currentUser.country}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isBlocked ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUnblock}
            className="text-blue-600 dark:text-blue-400"
          >
            <UserX2 className="h-4 w-4 mr-1" />
            Unblock
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenReportDialog}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenBlockDialog}>
                <UserX2 className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCloseChat}
          title="Close Chat"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
