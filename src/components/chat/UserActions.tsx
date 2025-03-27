
import React, { useCallback } from 'react';
import { X, MoreVertical, UserX2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialog } from '@/context/DialogContext';

interface UserActionsProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onCloseChat: () => void;
}

const UserActions = ({ 
  userId, 
  userName, 
  isBlocked, 
  onBlockUser, 
  onUnblockUser, 
  onCloseChat 
}: UserActionsProps) => {
  const { openDialog } = useDialog();
  
  const handleOpenReportDialog = useCallback(() => {
    requestAnimationFrame(() => {
      openDialog('report', { 
        userName: userName,
        userId: userId
      });
    });
  }, [openDialog, userName, userId]);

  const handleOpenBlockDialog = useCallback(() => {
    requestAnimationFrame(() => {
      openDialog('block', { 
        userName: userName,
        userId: userId, 
        onBlockUser: onBlockUser
      });
    });
  }, [openDialog, userName, userId, onBlockUser]);

  return (
    <div className="flex items-center space-x-2">
      {isBlocked ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onUnblockUser(userId)}
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
  );
};

export default UserActions;
