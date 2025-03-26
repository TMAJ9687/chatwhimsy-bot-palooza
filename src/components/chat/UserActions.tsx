
import React, { useCallback, useState, useEffect } from 'react';
import { X, MoreVertical, UserX2, Flag, Trash2, Images, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialog } from '@/context/DialogContext';
import SharedMediaDialog from './SharedMediaDialog';
import TranslateDialog from './TranslateDialog';
import DeleteConversationDialog from './DeleteConversationDialog';
import { Message } from '@/types/chat';

interface UserActionsProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
  isVip: boolean;
  messages: Message[];
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onDeleteConversation: (userId: string) => void;
  onCloseChat: () => void;
}

const UserActions = ({ 
  userId, 
  userName, 
  isBlocked, 
  isVip,
  messages,
  onBlockUser, 
  onUnblockUser,
  onDeleteConversation,
  onCloseChat 
}: UserActionsProps) => {
  const { openDialog } = useDialog();
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMessageText, setSelectedMessageText] = useState('');
  const [hasTextMessage, setHasTextMessage] = useState(false);
  
  // Check if there are any text messages to translate
  useEffect(() => {
    const lastTextMessage = [...messages]
      .filter(msg => msg.sender === 'bot' && !msg.isImage && !msg.isVoiceMessage && !msg.isGif)
      .pop();
    
    setHasTextMessage(!!lastTextMessage);
    if (lastTextMessage) {
      setSelectedMessageText(lastTextMessage.content);
    }
  }, [messages]);
  
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

  const handleOpenSharedMedia = useCallback(() => {
    setShowMediaDialog(true);
  }, []);

  const handleOpenTranslate = useCallback(() => {
    if (hasTextMessage) {
      setShowTranslateDialog(true);
    }
  }, [hasTextMessage]);

  const handleOpenDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDeleteConversation(userId);
    setShowDeleteDialog(false);
  }, [onDeleteConversation, userId]);

  return (
    <>
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
              
              {isVip && (
                <>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleOpenSharedMedia}>
                    <Images className="h-4 w-4 mr-2" />
                    Shared Media
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleOpenTranslate} 
                    disabled={!hasTextMessage}
                    className={!hasTextMessage ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    Translate
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleOpenDeleteDialog}
                    className="text-red-500 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Conversation
                  </DropdownMenuItem>
                </>
              )}
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
      
      {/* VIP dialogs */}
      {isVip && (
        <>
          <SharedMediaDialog 
            isOpen={showMediaDialog} 
            onClose={() => setShowMediaDialog(false)}
            messages={messages}
            botName={userName}
          />
          
          <TranslateDialog
            isOpen={showTranslateDialog}
            onClose={() => setShowTranslateDialog(false)}
            originalText={selectedMessageText}
          />
          
          <DeleteConversationDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleConfirmDelete}
            botName={userName}
          />
        </>
      )}
    </>
  );
};

export default UserActions;
