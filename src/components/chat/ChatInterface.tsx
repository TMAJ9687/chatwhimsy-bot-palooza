
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { useChat } from '@/context/ChatContext';
import { useLogout } from '@/hooks/useLogout'; // Add this import
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import ChatAppHeader from './ChatAppHeader';
import VipUpgradeSection from './VipUpgradeSection';
import NotificationSidebar from './NotificationSidebar';
import EmptyChatState from './EmptyChatState';

interface ChatInterfaceProps {
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user, isVip, isProfileComplete } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const { performLogout } = useLogout(); // Add this hook
  const [chatHidden, setChatHidden] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const navigationInProgressRef = useRef(false);
  const profileCheckCompletedRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    const cleanup = () => {
      try {
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
          if (modal && modal.parentNode) {
            try {
              modal.parentNode.removeChild(modal);
            } catch (error) {
              console.warn('Error removing modal:', error);
            }
          }
        });
      } catch (error) {
        console.warn('Error during modal cleanup:', error);
      }
    };
    cleanup();
    initializationTimeoutRef.current = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (
      isInitializing || 
      redirectAttempts > 2 || 
      navigationInProgressRef.current || 
      profileCheckCompletedRef.current
    ) {
      return;
    }
    const checkProfileStatus = () => {
      if (navigationInProgressRef.current) return;
      const storedProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
      if (storedProfileComplete) {
        console.log('Profile is complete according to localStorage');
        profileCheckCompletedRef.current = true;
        return;
      }
      const navigationInProgress = localStorage.getItem('vipNavigationInProgress') === 'true';
      if (navigationInProgress) {
        localStorage.removeItem('vipNavigationInProgress');
        return;
      }
      if (isVip && !isProfileComplete && !storedProfileComplete) {
        navigationInProgressRef.current = true;
        setRedirectAttempts(prev => prev + 1);
        console.log('Redirecting to VIP profile setup');
        localStorage.setItem('vipNavigationInProgress', 'true');
        setTimeout(() => {
          if (!profileCheckCompletedRef.current) {
            navigate('/vip-profile');
            setTimeout(() => {
              navigationInProgressRef.current = false;
              localStorage.removeItem('vipNavigationInProgress');
            }, 500);
          }
        }, 50);
      } else {
        profileCheckCompletedRef.current = true;
      }
    };
    const timeoutId = setTimeout(checkProfileStatus, 300);
    return () => clearTimeout(timeoutId);
  }, [isVip, isProfileComplete, navigate, isInitializing, redirectAttempts]);

  useEffect(() => {
    profileCheckCompletedRef.current = false;
  }, [isVip, isProfileComplete]);

  const {
    userChats,
    imagesRemaining,
    typingBots,
    currentBot,
    onlineUsers,
    blockedUsers,
    searchTerm,
    filters,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
    filteredUsers,
    unreadCount,
    setSearchTerm,
    setFilters,
    setShowInbox,
    setShowHistory,
    setRulesAccepted,
    handleBlockUser,
    handleUnblockUser,
    handleCloseChat,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    selectUser,
    handleFilterChange,
    handleNotificationRead,
    isUserBlocked
  } = useChat();

  React.useEffect(() => {
    if (!rulesAccepted && !isVip) {
      const timer = setTimeout(() => {
        openDialog('siteRules', { 
          onAccept: () => {
            setRulesAccepted(true);
          } 
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [openDialog, rulesAccepted, setRulesAccepted, isVip]);

  const handleLogout = useCallback(() => {
    openDialog('logout', { 
      onConfirm: () => {
        performLogout(() => {
          onLogout();
          navigate('/');
        });
      }
    });
  }, [onLogout, navigate, openDialog, performLogout]);

  const handleOpenInbox = useCallback(() => {
    setShowInbox(true);
    setShowHistory(false);
  }, [setShowInbox, setShowHistory]);

  const handleOpenHistory = useCallback(() => {
    setShowHistory(true);
    setShowInbox(false);
  }, [setShowHistory, setShowInbox]);

  const isCurrentUserBlocked = isUserBlocked(currentBot.id);

  const handleCompletelyCloseChat = useCallback(() => {
    setChatHidden(true);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background dark:bg-gray-950">
      <ChatAppHeader 
        unreadCount={unreadCount}
        onOpenInbox={handleOpenInbox}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex flex-col w-[350px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <UserList 
            users={filteredUsers}
            currentUserId={currentBot.id}
            onSelectUser={(user) => {
              selectUser(user);
              setChatHidden(false);
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {!isVip && <VipUpgradeSection />}
        </div>

        <MobileUserList 
          users={filteredUsers}
          currentUserId={currentBot.id}
          onSelectUser={(user) => {
            selectUser(user);
            setChatHidden(false);
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {!chatHidden ? (
            <>
              <ChatHeader 
                currentUser={currentBot}
                onBlockUser={handleBlockUser}
                onCloseChat={handleCompletelyCloseChat}
              />

              {isCurrentUserBlocked && (
                <div className="bg-gray-100 p-2 text-center text-gray-600 text-sm border-b border-gray-200">
                  This user is blocked. You won't receive messages from them.
                  <button 
                    onClick={() => handleUnblockUser(currentBot.id)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Unblock
                  </button>
                </div>
              )}

              <ChatMessages 
                messages={userChats[currentBot.id] || []}
                isTyping={typingBots[currentBot.id] || false}
                showStatus={isVip}
                showTyping={isVip}
              />
              
              <MessageInputBar
                onSendMessage={handleSendTextMessage}
                onSendImage={handleSendImageMessage}
                onSendVoice={handleSendVoiceMessage}
                imagesRemaining={imagesRemaining}
                disabled={isCurrentUserBlocked}
                userType={isVip ? 'vip' : 'standard'}
              />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>

      <NotificationSidebar
        isOpen={showInbox}
        onClose={() => setShowInbox(false)}
        notifications={unreadNotifications}
        onNotificationRead={handleNotificationRead}
        type="inbox"
      />

      <NotificationSidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        notifications={chatHistory}
        onNotificationRead={() => {}}
        type="history"
      />
    </div>
  );
};

export default ChatInterface;
