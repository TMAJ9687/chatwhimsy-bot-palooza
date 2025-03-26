
import React, { useCallback } from 'react';
import { MoreVertical, X, UserX, UserCheck } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useDialog } from '@/context/DialogContext';
import { useChat } from '@/context/ChatContext';

interface ChatHeaderProps {
  currentUser: {
    id: string;
    name: string;
    gender: string;
    age: number;
  };
  onCloseChat?: () => void;
}

// Simplified implementation with fewer callback recreations
const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentUser,
  onCloseChat,
}) => {
  const { openDialog } = useDialog();
  const { handleBlockUser, handleUnblockUser, blockedUsers } = useChat();
  
  // Check if current user is blocked
  const isBlocked = blockedUsers.includes(currentUser.id);

  // Using useCallback to prevent unnecessary recreations
  const handleOpenReportDialog = useCallback(() => {
    openDialog('report', { userName: currentUser.name });
  }, [openDialog, currentUser.name]);

  const handleOpenBlockDialog = useCallback(() => {
    openDialog('block', { 
      userName: currentUser.name,
      userId: currentUser.id,
      onBlockUser: handleBlockUser
    });
  }, [openDialog, currentUser.name, currentUser.id, handleBlockUser]);

  const handleUnblock = useCallback(() => {
    handleUnblockUser(currentUser.id);
  }, [handleUnblockUser, currentUser.id]);

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {currentUser.name}
            {isBlocked && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                Blocked
              </span>
            )}
          </h2>
          <span className="ml-2 text-sm font-medium text-pink-500 dark:text-pink-400">
            {currentUser.gender === 'female' ? 'Female' : 'Male'}, {currentUser.age}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Menu"
              type="button"
            >
              <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenReportDialog}>
              Report
            </DropdownMenuItem>
            {isBlocked ? (
              <DropdownMenuItem onClick={handleUnblock}>
                <UserCheck className="h-4 w-4 mr-2" />
                Unblock
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleOpenBlockDialog}>
                <UserX className="h-4 w-4 mr-2" />
                Block
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <button 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close chat"
          type="button"
          onClick={onCloseChat}
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(ChatHeader);
