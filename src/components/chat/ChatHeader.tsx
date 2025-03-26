
import React, { memo, useCallback } from 'react';
import { Flag, X, MoreVertical, Ban, UserX2 } from 'lucide-react';
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
        <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-500 mr-3">
          {currentUser.name.charAt(0)}
        </div>
        
        <div>
          <div className="flex items-center">
            <span className="font-medium">{currentUser.name}</span>
            {currentUser.vip && (
              <span className="ml-2 bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-sm">
                VIP
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span className="mr-2">
              {currentUser.gender === 'female' ? 'Female' : 'Male'}, {currentUser.age}
            </span>
            
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
            className="text-blue-600"
          >
            <Ban className="h-4 w-4 mr-1" />
            Unblock
          </Button>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleOpenReportDialog}
              title="Report User"
            >
              <Flag className="h-4 w-4 text-gray-500" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleOpenBlockDialog}>
                  <UserX2 className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCloseChat}
          title="Close Chat"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
