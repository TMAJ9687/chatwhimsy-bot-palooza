
import React, { useCallback } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useDialog } from '@/context/DialogContext';

interface ChatHeaderProps {
  currentUser: {
    name: string;
    gender: string;
    age: number;
  };
  onBlockUser: () => void;
  onCloseChat?: () => void;
}

// Simplified implementation with fewer callback recreations
const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentUser,
  onBlockUser,
  onCloseChat,
}) => {
  const { openDialog } = useDialog();

  // Using useCallback to prevent unnecessary recreations
  const handleOpenReportDialog = useCallback(() => {
    openDialog('report', { userName: currentUser.name });
  }, [openDialog, currentUser.name]);

  const handleOpenBlockDialog = useCallback(() => {
    openDialog('block', { 
      userName: currentUser.name,
      onBlockUser: onBlockUser
    });
  }, [openDialog, currentUser.name, onBlockUser]);

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">{currentUser.name}</h2>
        <div className="ml-2 text-pink-500 text-sm">
          {currentUser.gender === 'female' ? 'Female' : 'Male'}, {currentUser.age}
        </div>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
              type="button"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenReportDialog}>
              Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenBlockDialog}>
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onCloseChat && (
          <button 
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            type="button"
            onClick={onCloseChat}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(ChatHeader);
