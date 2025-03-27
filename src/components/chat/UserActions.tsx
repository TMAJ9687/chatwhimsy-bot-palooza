
import React, { useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import VipContextMenu from './VipContextMenu';
import SharedMediaDialog from './SharedMediaDialog';
import TranslateDialog from './TranslateDialog';
import { Message } from '@/types/chat';

interface UserActionsProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onCloseChat: () => void;
  onDeleteConversation?: () => void;
  messages?: Message[];
}

const UserActions = ({ 
  userId, 
  userName, 
  isBlocked, 
  onBlockUser, 
  onUnblockUser, 
  onCloseChat,
  onDeleteConversation,
  messages = []
}: UserActionsProps) => {
  const { openDialog } = useDialog();
  const { isVip } = useUser();
  const [isSharedMediaOpen, setIsSharedMediaOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  
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

  const handleDeleteConversation = useCallback(() => {
    if (onDeleteConversation) {
      requestAnimationFrame(() => {
        openDialog('confirmation', {
          title: "Delete Conversation",
          message: `Are you sure you want to delete your conversation with ${userName}? This cannot be undone.`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          onConfirm: onDeleteConversation,
        });
      });
    }
  }, [openDialog, userName, onDeleteConversation]);

  if (isBlocked) {
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onUnblockUser(userId)}
          className="text-blue-600 dark:text-blue-400"
        >
          Unblock
        </Button>
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
  }

  // For VIP users, show the enhanced context menu
  if (isVip) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <VipContextMenu 
            onReport={handleOpenReportDialog}
            onBlock={handleOpenBlockDialog}
            onDeleteConversation={handleDeleteConversation}
            onViewSharedMedia={() => setIsSharedMediaOpen(true)}
            onTranslate={() => setIsTranslateOpen(true)}
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCloseChat}
            title="Close Chat"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>

        {/* Shared Media Dialog */}
        <SharedMediaDialog 
          isOpen={isSharedMediaOpen}
          onClose={() => setIsSharedMediaOpen(false)}
          messages={messages}
          userName={userName}
        />
        
        {/* Translate Dialog */}
        <TranslateDialog 
          isOpen={isTranslateOpen}
          onClose={() => setIsTranslateOpen(false)}
          messages={messages}
          userName={userName}
        />
      </>
    );
  }

  // For regular users, show the standard menu
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleOpenBlockDialog}
      >
        Block
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleOpenReportDialog}
      >
        Report
      </Button>
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
