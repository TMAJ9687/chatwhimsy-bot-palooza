
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { MoreVertical, Ban, Flag, Trash2, Share, Globe, X, UserMinus, Shield, Award } from 'lucide-react';
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
import { memoize } from '@/utils/performanceMonitor';

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
  const { isVip, isAdmin } = useUser();
  const { userChats, getSharedMedia, handleDeleteConversation, handleTranslateMessage, isAdmin: chatIsAdmin } = useChat();
  
  const [showSharedMediaDialog, setShowSharedMediaDialog] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [cachedMedia, setCachedMedia] = useState<{ images: any[], voice: any[] }>({ images: [], voice: [] });
  
  // Refs to store animation frame IDs for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Memoize media cache to avoid recalculations
  const getLastTextMessage = useCallback(
    memoize((userId: string) => {
      const messages = userChats[userId] || [];
      
      // Reverse iteration for better performance
      for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].isImage && !messages[i].isVoice) {
          return messages[i];
        }
      }
      
      return null;
    }),
    [userChats]
  );
  
  // Optimize dialog open/close handlers with requestAnimationFrame
  const handleReport = useCallback(() => {
    // Cancel any pending animation frames
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame to prevent UI freeze
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('report', { userName });
    });
  }, [userName, openDialog]);
  
  const handleBlock = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('block', { userName, userId, onBlockUser });
    });
  }, [userName, userId, onBlockUser, openDialog]);
  
  const handleUnblock = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame to prevent UI freeze
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      onUnblockUser(userId);
    });
  }, [userId, onUnblockUser]);
  
  const handleDeleteChat = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('confirm', {
        title: 'Delete Conversation',
        message: `Are you sure you want to delete the conversation with ${userName}?`,
        onConfirm: () => {
          // Nested requestAnimationFrame for better responsiveness
          requestAnimationFrame(() => {
            handleDeleteConversation(userId);
          });
        },
      });
    });
  }, [userId, userName, handleDeleteConversation, openDialog]);
  
  // Admin actions
  const handleKickUser = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('confirm', {
        title: 'Kick User',
        message: `Are you sure you want to kick ${userName}?`,
        onConfirm: () => {
          console.log(`Admin kicked user: ${userId}`);
          // In a real app, this would call an API to kick the user
        },
      });
    });
  }, [userId, userName, openDialog]);
  
  const handleBanUser = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('confirm', {
        title: 'Ban User',
        message: `Are you sure you want to ban ${userName}?`,
        onConfirm: () => {
          console.log(`Admin banned user: ${userId}`);
          // In a real app, this would call an API to ban the user
        },
      });
    });
  }, [userId, userName, openDialog]);
  
  const handleUpgradeToVIP = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('prompt', {
        title: 'Upgrade to VIP',
        message: `Select the duration for ${userName}'s VIP status:`,
        placeholder: 'Select duration',
        options: ['1 Day', '1 Week', '1 Month', '1 Year', 'Lifetime'],
        defaultValue: '1 Month',
        confirmLabel: 'Upgrade',
        onConfirm: (duration: string) => {
          console.log(`Admin upgraded user ${userId} to VIP for ${duration}`);
          // In a real app, this would call an API to upgrade the user
        },
      });
    });
  }, [userId, userName, openDialog]);
  
  const handleDowngradeFromVIP = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openDialog('confirm', {
        title: 'Remove VIP Status',
        message: `Are you sure you want to remove VIP status from ${userName}?`,
        onConfirm: () => {
          console.log(`Admin downgraded user ${userId} from VIP`);
          // In a real app, this would call an API to downgrade the user
        },
      });
    });
  }, [userId, userName, openDialog]);

  const handleOpenSharedMedia = useCallback(() => {
    // Only fetch media when opening the dialog
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Mark performance for debugging
    performance.mark('shared_media_fetch_start');
    
    // Use requestAnimationFrame to prevent UI freeze
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      
      // Get media data
      const media = getSharedMedia(userId);
      
      // Cache media data
      setCachedMedia(media);
      
      // Show dialog
      setShowSharedMediaDialog(true);
      
      performance.mark('shared_media_fetch_end');
      performance.measure(
        'Shared Media Fetch',
        'shared_media_fetch_start',
        'shared_media_fetch_end'
      );
    });
  }, [getSharedMedia, userId]);

  const handleOpenTranslateDialog = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Performance mark to track operation duration
    performance.mark('translate_dialog_start');
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      
      const lastTextMessage = getLastTextMessage(userId);
      
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
      performance.measure(
        'Translate Dialog Operation', 
        'translate_dialog_start', 
        'translate_dialog_end'
      );
    });
  }, [getLastTextMessage, userId, openDialog]);

  const handleTranslate = useCallback((language: string) => {
    if (!selectedMessageId) return;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame to prevent UI freeze
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      handleTranslateMessage(selectedMessageId, language);
      setSelectedMessageId(null);
    });
  }, [selectedMessageId, handleTranslateMessage]);

  // Clean up animation frames on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  
  // Close dialog handlers with animation frame for performance
  const handleCloseSharedMediaDialog = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setShowSharedMediaDialog(false);
    });
  }, []);
  
  const handleCloseTranslateDialog = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setShowTranslateDialog(false);
    });
  }, []);

  // Memoize dropdown items to prevent unnecessary re-renders
  const dropdownItems = useMemo(() => {
    // Determine if the user is a VIP from the chat state
    const messages = userChats[userId] || [];
    const userProfile = messages.length > 0 ? 
      (messages[0].senderProfile || { vip: false }) : 
      { vip: false };
    const isUserVip = userProfile.vip || false;

    return (
      <>
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
        
        {/* Admin-only options */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={handleKickUser}>
              <UserMinus className="h-4 w-4 mr-2 text-orange-500" />
              <span>Kick User</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleBanUser}>
              <Shield className="h-4 w-4 mr-2 text-red-500" />
              <span>Ban User</span>
            </DropdownMenuItem>
            
            {isUserVip ? (
              <DropdownMenuItem onClick={handleDowngradeFromVIP}>
                <Award className="h-4 w-4 mr-2 text-purple-500" />
                <span>Remove VIP Status</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleUpgradeToVIP}>
                <Award className="h-4 w-4 mr-2 text-amber-500" />
                <span>Upgrade to VIP</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </>
    );
  }, [
    isBlocked, 
    isVip,
    isAdmin,
    userId,
    userChats,
    handleUnblock, 
    handleBlock, 
    handleReport, 
    handleOpenSharedMedia,
    handleOpenTranslateDialog,
    handleDeleteChat,
    handleKickUser,
    handleBanUser,
    handleUpgradeToVIP,
    handleDowngradeFromVIP
  ]);

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
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 action-menu">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 action-menu">
            {dropdownItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Shared Media Dialog - VIP only */}
      {isVip && (
        <SharedMediaDialog
          isOpen={showSharedMediaDialog}
          onClose={handleCloseSharedMediaDialog}
          media={cachedMedia}
          userName={userName}
        />
      )}

      {/* Translate Message Dialog */}
      <TranslateMessageDialog
        isOpen={showTranslateDialog}
        onClose={handleCloseTranslateDialog}
        onTranslate={handleTranslate}
      />
    </>
  );
};

export default React.memo(UserActions);
