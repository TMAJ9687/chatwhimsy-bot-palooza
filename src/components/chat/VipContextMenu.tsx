
import React from 'react';
import { Flag, Trash2, UserX2, Image, Mic, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface VipContextMenuProps {
  onReport: () => void;
  onBlock: () => void;
  onDeleteConversation: () => void;
  onViewSharedMedia: () => void;
  onTranslate: () => void;
}

const VipContextMenu = ({
  onReport,
  onBlock,
  onDeleteConversation,
  onViewSharedMedia,
  onTranslate,
}: VipContextMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
            <path d="M1.5 1.5C1.5 2.33 2.17 3 3 3C3.83 3 4.5 2.33 4.5 1.5C4.5 0.67 3.83 0 3 0C2.17 0 1.5 0.67 1.5 1.5ZM6 1.5C6 2.33 6.67 3 7.5 3C8.33 3 9 2.33 9 1.5C9 0.67 8.33 0 7.5 0C6.67 0 6 0.67 6 1.5ZM10.5 1.5C10.5 2.33 11.17 3 12 3C12.83 3 13.5 2.33 13.5 1.5C13.5 0.67 12.83 0 12 0C11.17 0 10.5 0.67 10.5 1.5Z" fill="currentColor"/>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onViewSharedMedia} className="cursor-pointer flex items-center">
          <div className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            <Mic className="h-4 w-4 mr-2" />
            Shared Media
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTranslate} className="cursor-pointer">
          <Languages className="h-4 w-4 mr-2" />
          Translate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onBlock} className="cursor-pointer">
          <UserX2 className="h-4 w-4 mr-2" />
          Block User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReport} className="cursor-pointer">
          <Flag className="h-4 w-4 mr-2" />
          Report User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDeleteConversation} className="cursor-pointer text-red-500 focus:text-red-500">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VipContextMenu;
