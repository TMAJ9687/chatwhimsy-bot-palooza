
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { useChat } from '@/context/ChatContext';
import { useLogout } from '@/hooks/useLogout';
import AdminChatView from './AdminChatView';
import RegularChatView from './RegularChatView';
import { createCleanupFunction, clearTimers } from '@/utils/cleanup';

interface ChatInterfaceProps {
  onLogout: () => void;
  adminView?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout, adminView = false }) => {
  const { user, isVip, isProfileComplete } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [chatHidden, setChatHidden] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const { performLogout } = useLogout();
  
  // Refs for cleanup and state tracking
  const navigationInProgressRef = useRef(false);
  const profileCheckCompletedRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Improved initialization flow with better state management
  useEffect(() => {
    // Set overflow to auto in React way rather than direct DOM manipulation
    document.body.style.overflow = 'auto';
    
    // Short delay to allow component to fully mount
    initializationTimeoutRef.current = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
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
        
        // Mark navigation in progress in localStorage
        localStorage.setItem('vipNavigationInProgress', 'true');
        
        // Use setTimeout to push navigation to next event loop tick
        const timeoutId = setTimeout(() => {
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
        
        return () => clearTimeout(timeoutId);
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

  // Show site rules dialog after mounting, with better cleanup
  useEffect(() => {
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
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [adminView, openDialog, rulesAccepted, setRulesAccepted, isVip]);

  // Navigation handlers with useCallback for better performance
  const handleLogout = React.useCallback(() => {
    openDialog('logout', { 
      onConfirm: () => {
        performLogout();
        // The logout function will handle navigation
      }
    });
  }, [performLogout, openDialog]);

  const handleOpenInbox = React.useCallback(() => {
    setShowInbox(true);
    setShowHistory(false);
  }, [setShowInbox, setShowHistory]);

  const handleOpenHistory = React.useCallback(() => {
    setShowHistory(true);
    setShowInbox(false);
  }, [setShowHistory, setShowInbox]);

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

  // Use a different component for admin vs regular view
  if (adminView) {
    return (
      <AdminChatView
        currentBot={currentBot}
        userChats={userChats}
        typingBots={typingBots}
        filteredUsers={filteredUsers}
        searchTerm={searchTerm}
        filters={filters}
        imagesRemaining={imagesRemaining}
        chatHidden={chatHidden}
        setChatHidden={setChatHidden}
        handleBlockUser={handleBlockUser}
        handleUnblockUser={handleUnblockUser}
        handleSendTextMessage={handleSendTextMessage}
        handleSendImageMessage={handleSendImageMessage}
        handleSendVoiceMessage={handleSendVoiceMessage}
        selectUser={selectUser}
        setSearchTerm={setSearchTerm}
        handleFilterChange={handleFilterChange}
        isUserBlocked={isUserBlocked}
      />
    );
  }

  // Regular chat view for non-admin
  return (
    <RegularChatView
      currentBot={currentBot}
      userChats={userChats}
      typingBots={typingBots}
      filteredUsers={filteredUsers}
      searchTerm={searchTerm}
      filters={filters}
      imagesRemaining={imagesRemaining}
      chatHidden={chatHidden}
      setChatHidden={setChatHidden}
      showInbox={showInbox}
      showHistory={showHistory}
      setShowInbox={setShowInbox}
      setShowHistory={setShowHistory}
      unreadNotifications={unreadNotifications}
      chatHistory={chatHistory}
      unreadCount={unreadCount}
      isVip={isVip}
      handleBlockUser={handleBlockUser}
      handleUnblockUser={handleUnblockUser}
      handleSendTextMessage={handleSendTextMessage}
      handleSendImageMessage={handleSendImageMessage}
      handleSendVoiceMessage={handleSendVoiceMessage}
      selectUser={selectUser}
      setSearchTerm={setSearchTerm}
      handleFilterChange={handleFilterChange}
      handleNotificationRead={handleNotificationRead}
      isUserBlocked={isUserBlocked}
      handleOpenInbox={handleOpenInbox}
      handleOpenHistory={handleOpenHistory}
      handleLogout={handleLogout}
    />
  );
};

export default ChatInterface;
