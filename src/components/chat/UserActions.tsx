
import React, { useState } from 'react';
import { MoreVertical, Ban, Flag, Trash2, Share, Globe, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChat } from '@/context/ChatContext';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import SharedMediaDialog from './SharedMediaDialog';
import TranslateMessageDialog from './TranslateMessageDialog';

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
  onCloseChat,
}: UserActionsProps) => {
  const { openDialog } = useDialog();
  const { isVip } = useUser();
  const { getSharedMedia, handleDeleteConversation } = useChat();
  
  const [showSharedMediaDialog, setShowSharedMediaDialog] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const handleReport = () => {
    openDialog('report', { userName });
  };
  
  const handleBlock = () => {
    openDialog('block', { userName, userId, onBlockUser });
  };
  
  const handleUnblock = () => {
    onUnblockUser(userId);
  };
  
  const handleDeleteChat = () => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete the conversation with ${userName}?`)) {
      handleDeleteConversation(userId);
    }
  };
  
  const handleOpenSharedMedia = () => {
    setShowSharedMediaDialog(true);
  };

  const handleTranslateMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowTranslateDialog(true);
  };

  const handleTranslate = (language: string) => {
    if (selectedMessageId) {
      // Get the last message ID as a fallback
      const { handleTranslateMessage } = useChat();
      handleTranslateMessage(selectedMessageId, language);
      setSelectedMessageId(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={onCloseChat}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isBlocked ? (
              <DropdownMenuItem onClick={handleUnblock}>
                <Ban className="h-4 w-4 mr-2 text-green-500" />
                <span>Unblock User</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleBlock}>
                <Ban className="h-4 w-4 mr-2 text-red-500" />
                <span>Block User</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="h-4 w-4 mr-2 text-amber-500" />
              <span>Report User</span>
            </DropdownMenuItem>
            
            {/* VIP-only options */}
            {isVip && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>VIP Options</DropdownMenuLabel>
                
                <DropdownMenuItem onClick={handleOpenSharedMedia}>
                  <Share className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Shared Media</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleDeleteChat}>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  <span>Delete Conversation</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Shared Media Dialog - VIP only */}
      {isVip && (
        <SharedMediaDialog
          isOpen={showSharedMediaDialog}
          onClose={() => setShowSharedMediaDialog(false)}
          media={getSharedMedia(userId)}
          userName={userName}
        />
      )}

      {/* Translate Message Dialog */}
      <TranslateMessageDialog
        isOpen={showTranslateDialog}
        onClose={() => setShowTranslateDialog(false)}
        onTranslate={handleTranslate}
      />
    </>
  );
};

export default UserActions;
