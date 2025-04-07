
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { useChat } from '@/context/ChatContext';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import ChatAppHeader from './ChatAppHeader';
import VipUpgradeSection from './VipUpgradeSection';
import NotificationSidebar from './NotificationSidebar';
import EmptyChatState from './EmptyChatState';
import { useLogout } from '@/hooks/useLogout';

interface ChatInterfaceProps {
  onLogout: () => void;
  adminView?: boolean; // New prop to indicate if we're in admin view
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout, adminView = false }) => {
  const { user, isVip, isProfileComplete } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [chatHidden, setChatHidden] = useState(true); // Set to true by default
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const { performLogout } = useLogout(); // Add this hook for direct logout access
  
  // Enhanced navigation guards
  const navigationInProgressRef = useRef(false);
  const profileCheckCompletedRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Improved initialization flow with better state management
  useEffect(() => {
    // Clean start for UI - avoid rapid UI flashes during redirect checks
    document.body.style.overflow = 'auto';
    
    // Clean up any leftover modals from previous views
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
    
    // Short delay to allow component to fully mount
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
  
  // Skip profile checks and navigation in admin view
  useEffect(() => {
    // Skip check if in admin view or other conditions are met
    if (
      adminView ||
      isInitializing || 
      redirectAttempts > 2 || 
      navigationInProgressRef.current || 
      profileCheckCompletedRef.current
    ) {
      return;
    }
    
    // Check if VIP and profile incomplete (with localStorage backup check)
    const checkProfileStatus = () => {
      // If navigation is already in progress, skip this check
      if (navigationInProgressRef.current) return;
      
      // First check localStorage for immediate value (in case context isn't updated yet)
      const storedProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
      
      // Skip navigation if we already know profile is complete
      if (storedProfileComplete) {
        console.log('Profile is complete according to localStorage');
        profileCheckCompletedRef.current = true;
        return;
      }
      
      // Check if navigation is in progress from VIP profile
      const navigationInProgress = localStorage.getItem('vipNavigationInProgress') === 'true';
      
      // Don't redirect during active navigation
      if (navigationInProgress) {
        localStorage.removeItem('vipNavigationInProgress');
        return;
      }
      
      // If user is VIP but profile is not complete based on both checks
      if (isVip && !isProfileComplete && !storedProfileComplete) {
        // Set the navigation guard to prevent multiple redirects
        navigationInProgressRef.current = true;
        setRedirectAttempts(prev => prev + 1);
        
        console.log('Redirecting to VIP profile setup');
        
        // Mark navigation in progress in localStorage
        localStorage.setItem('vipNavigationInProgress', 'true');
        
        // Use setTimeout to push navigation to next event loop tick
        setTimeout(() => {
          // Double-check before navigation
          if (!profileCheckCompletedRef.current) {
            navigate('/vip-profile');
            
            // Reset the navigation guard after a short delay
            setTimeout(() => {
              navigationInProgressRef.current = false;
              localStorage.removeItem('vipNavigationInProgress');
            }, 500);
          }
        }, 50);
      } else {
        // Mark check as completed if no redirect needed
        profileCheckCompletedRef.current = true;
      }
    };
    
    // Debounce the check to prevent rapid checks
    const timeoutId = setTimeout(checkProfileStatus, 300);
    
    return () => clearTimeout(timeoutId);
  }, [adminView, isVip, isProfileComplete, navigate, isInitializing, redirectAttempts]);
  
  // Reset profile check completed flag when dependencies change
  useEffect(() => {
    profileCheckCompletedRef.current = false;
  }, [isVip, isProfileComplete]);
  
  // Use existing chat state from the context
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

  // Show site rules dialog after 3 seconds, but only if rules haven't been accepted yet
  // and user is not VIP (VIP users bypass this) - skip in admin view
  React.useEffect(() => {
    // Skip in admin view
    if (adminView) return;
    
    // Only show the dialog if rules haven't been accepted yet and user is not VIP
    if (!rulesAccepted && !isVip) {
      // Use a longer delay to ensure all components are properly loaded
      const timer = setTimeout(() => {
        // Make sure component is still mounted before showing dialog
        openDialog('siteRules', { 
          onAccept: () => {
            // Mark rules as accepted when user clicks Accept
            setRulesAccepted(true);
          } 
        });
      }, 5000); // Increased from 3000 to 5000 to allow more loading time
      
      return () => clearTimeout(timer);
    }
  }, [adminView, openDialog, rulesAccepted, setRulesAccepted, isVip]);

  // Navigation handlers - optimized with useCallback
  const handleLogout = useCallback(() => {
    openDialog('logout', { 
      onConfirm: () => {
        performLogout(); // Use the actual logout function from the hook
        // The logout function will handle navigation
      }
    });
  }, [performLogout, openDialog]);

  const handleOpenInbox = useCallback(() => {
    setShowInbox(true);
    setShowHistory(false);
  }, [setShowInbox, setShowHistory]);

  const handleOpenHistory = useCallback(() => {
    setShowHistory(true);
    setShowInbox(false);
  }, [setShowHistory, setShowInbox]);

  // Check if current user is blocked
  const isCurrentUserBlocked = isUserBlocked(currentBot.id);
  
  // Handle completely closing chat
  const handleCompletelyCloseChat = useCallback(() => {
    setChatHidden(true);
  }, []);

  // Loading state while initializing
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

  // Use a different layout for admin view
  if (adminView) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Chat area for admin view */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {!chatHidden ? (
            <>
              {/* Chat header component */}
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

              {/* Messages area component */}
              <ChatMessages 
                messages={userChats[currentBot.id] || []}
                isTyping={typingBots[currentBot.id] || false}
                showStatus={true}
                showTyping={true}
              />
              
              {/* Message input component */}
              <MessageInputBar
                onSendMessage={handleSendTextMessage}
                onSendImage={handleSendImageMessage}
                onSendVoice={handleSendVoiceMessage}
                imagesRemaining={imagesRemaining}
                disabled={isCurrentUserBlocked}
                userType="vip"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="text-lg text-gray-500 mb-4">Select a user to start chatting</p>
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
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular chat view for non-admin
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background dark:bg-gray-950">
      {/* Header with icons */}
      <ChatAppHeader 
        unreadCount={unreadCount}
        onOpenInbox={handleOpenInbox}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - User list (desktop) */}
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
          
          {/* VIP Upgrade Section - Only show for non-VIP users */}
          {!isVip && <VipUpgradeSection />}
        </div>

        {/* Mobile user list trigger */}
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

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {!chatHidden ? (
            <>
              {/* Chat header component */}
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

              {/* Messages area component */}
              <ChatMessages 
                messages={userChats[currentBot.id] || []}
                isTyping={typingBots[currentBot.id] || false}
                showStatus={isVip}
                showTyping={isVip}
              />
              
              {/* Message input component */}
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

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={showInbox}
        onClose={() => setShowInbox(false)}
        notifications={unreadNotifications}
        onNotificationRead={handleNotificationRead}
        type="inbox"
      />

      {/* History Sidebar */}
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
