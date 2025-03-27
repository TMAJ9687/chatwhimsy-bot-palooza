
import React, { useState, useCallback, useRef, useMemo } from 'react';
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
  // Properly defined hooks at the top level
  const { openDialog } = useDialog();
  const { isVip } = useUser();
  const { userChats, getSharedMedia, handleDeleteConversation, handleTranslateMessage } = useChat();
  
  const [showSharedMediaDialog, setShowSharedMediaDialog] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Message cache reference to prevent recalculations
  const messageCache = useRef<Map<string, any>>(new Map());
  
  // Clear cache when chats change
  useMemo(() => {
    messageCache.current.clear();
  }, [userChats]);
  
  // Optimized function to find the last text message
  const getLastTextMessage = useCallback(() => {
    // Use cached result if available
    if (messageCache.current.has(userId)) {
      return messageCache.current.get(userId);
    }
    
    const messages = userChats[userId] || [];
    let result = null;
    
    // Reverse iteration without creating new array
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isImage && !messages[i].isVoice) {
        result = messages[i];
        break;
      }
    }
    
    // Cache the result
    messageCache.current.set(userId, result);
    return result;
  }, [userChats, userId]);
  
  // Memoize handlers to prevent recreation on every render
  const handleReport = useCallback(() => {
    openDialog('report', { userName });
  }, [userName, openDialog]);
  
  const handleBlock = useCallback(() => {
    openDialog('block', { userName, userId, onBlockUser });
  }, [userName, userId, onBlockUser, openDialog]);
  
  const handleUnblock = useCallback(() => {
    // Use requestAnimationFrame to prevent UI freeze
    requestAnimationFrame(() => {
      onUnblockUser(userId);
    });
  }, [userId, onUnblockUser]);
  
  const handleDeleteChat = useCallback(() => {
    openDialog('confirm', {
      title: 'Delete Conversation',
      message: `Are you sure you want to delete the conversation with ${userName}?`,
      onConfirm: () => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          handleDeleteConversation(userId);
        });
      },
    });
  }, [userId, userName, handleDeleteConversation, openDialog]);
  
  const handleOpenSharedMedia = useCallback(() => {
    setShowSharedMediaDialog(true);
  }, []);

  const handleOpenTranslateDialog = useCallback(() => {
    // Performance mark to track operation duration
    performance.mark('translate_dialog_start');
    
    const lastTextMessage = getLastTextMessage();
    
    if (lastTextMessage) {
      setSelectedMessageId(lastTextMessage.id);
      setShowTranslateDialog(true);
    } else {
      openDialog('alert', { 
        title: 'No Messages to Translate',
        message: "No text messages found to translate"
      });
    }
    
    performance.mark('translate_dialog_end');
    performance.measure('Translate Dialog Operation', 'translate_dialog_start', 'translate_dialog_end');
  }, [getLastTextMessage, openDialog]);

  const handleTranslate = useCallback((language: string) => {
    if (selectedMessageId) {
      // Use requestAnimationFrame to prevent UI freeze
      requestAnimationFrame(() => {
        handleTranslateMessage(selectedMessageId, language);
        setSelectedMessageId(null);
      });
    }
  }, [selectedMessageId, handleTranslateMessage]);

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
                
                <DropdownMenuItem onClick={handleOpenTranslateDialog}>
                  <Globe className="h-4 w-4 mr-2 text-indigo-500" />
                  <span>Translate Last Message</span>
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

export default React.memo(UserActions);
