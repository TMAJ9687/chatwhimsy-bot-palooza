
import React, { useCallback } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';

interface ChatHeaderProps {
  currentUser: {
    name: string;
    gender: string;
    age: number;
  };
  onOpenReportDialog: () => void;
  onOpenBlockDialog: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentUser,
  onOpenReportDialog,
  onOpenBlockDialog,
}) => {
  // Use useCallback to prevent unnecessary renders
  const handleReportClick = useCallback(() => {
    onOpenReportDialog();
  }, [onOpenReportDialog]);

  const handleBlockClick = useCallback(() => {
    onOpenBlockDialog();
  }, [onOpenBlockDialog]);

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
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReportClick}>
              Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBlockClick}>
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
