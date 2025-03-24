import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { DialogProvider } from '@/context/DialogContext';
import DialogContainer from '@/components/dialogs/DialogContainer';
import { ChatProvider, useChat } from '@/context/ChatContext';

// Import our components
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import ChatAppHeader from './ChatAppHeader';
import VipUpgradeSection from './VipUpgradeSection';
import NotificationSidebar from './NotificationSidebar';

interface ChatInterfaceProps {
  onLogout: () => void;
}

// Empty chat view when no user is selected
const EmptyChatView = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8 text-center">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Select a chat to start messaging</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        Choose a user from the list to begin a conversation or continue one of your existing chats.
      </p>
    </div>
  );
};

// Main component that uses our new dialog context
const ChatInterfaceContent: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [hasActiveChat, setHasActiveChat] = useState(false);
  
  const {
    userChats,
    imagesRemaining,
    typingBots,
    currentBot,
    onlineUsers,
    searchTerm,
    filters,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
    filteredUsers,
    unreadCount,
    isVip,
    setSearchTerm,
    setFilters,
    setShowInbox,
    setShowHistory,
    setRulesAccepted,
    handleBlockUser,
    handleCloseChat,
    handleSendTextMessage,
    handleSendImageMessage,
    selectUser,
    handleFilterChange,
    handleNotificationRead,
    openConversationFromNotification
  } = useChat();

  // Show site rules dialog after 3 seconds, but only if rules haven't been accepted yet
  React.useEffect(() => {
    // Only show the dialog if rules haven't been accepted yet
    if (!rulesAccepted) {
      const timer = setTimeout(() => {
        openDialog('siteRules', { 
          onAccept: () => {
            // Mark rules as accepted when user clicks Accept
            setRulesAccepted(true);
          } 
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [openDialog, rulesAccepted, setRulesAccepted]);

  // Keep track of whether there's an active chat
  React.useEffect(() => {
    // When the component first mounts, don't automatically select a chat
    if (currentBot && currentBot.id !== undefined) {
      setHasActiveChat(true);
    }
  }, [currentBot]);

  // Navigation handlers - optimized with useCallback
  const handleLogout = useCallback(() => {
    openDialog('logout', { 
      onConfirm: () => {
        onLogout();
        navigate('/');
      }
    });
  }, [onLogout, navigate, openDialog]);

  const handleOpenInbox = useCallback(() => {
    setShowInbox(true);
    setShowHistory(false);
  }, [setShowInbox, setShowHistory]);

  const handleOpenHistory = useCallback(() => {
    setShowHistory(true);
    setShowInbox(false);
  }, [setShowHistory, setShowInbox]);

  // Enhanced handle close chat
  const onCloseChat = useCallback(() => {
    handleCloseChat();
    setHasActiveChat(false);
  }, [handleCloseChat]);

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
            currentUserId={currentBot?.id || ""}
            onSelectUser={(user) => {
              selectUser(user);
              setHasActiveChat(true);
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          {/* VIP Upgrade Section */}
          <VipUpgradeSection />
        </div>

        {/* Mobile user list trigger */}
        <MobileUserList 
          users={filteredUsers}
          currentUserId={currentBot?.id || ""}
          onSelectUser={(user) => {
            selectUser(user);
            setHasActiveChat(true);
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main chat area */}
        {hasActiveChat && currentBot ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Chat header component */}
            <ChatHeader 
              currentUser={currentBot}
              onBlockUser={handleBlockUser}
              onCloseChat={onCloseChat}
            />

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
              imagesRemaining={imagesRemaining}
            />
          </div>
        ) : (
          <EmptyChatView />
        )}
      </div>

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={showInbox}
        onClose={() => setShowInbox(false)}
        notifications={unreadNotifications}
        onNotificationRead={handleNotificationRead}
        type="inbox"
        onClickNotification={openConversationFromNotification}
      />

      {/* History Sidebar */}
      <NotificationSidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        notifications={chatHistory}
        onNotificationRead={() => {}}
        type="history"
        onClickNotification={(senderId) => {
          // Find the bot with this ID
          const bot = onlineUsers.find(user => user.id === senderId);
          if (bot) {
            selectUser(bot);
            setHasActiveChat(true);
            setShowHistory(false);
          }
        }}
      />
    </div>
  );
};

// Create a wrapper component that provides the dialog context and chat context
const ChatInterface: React.FC<ChatInterfaceProps> = (props) => {
  return (
    <DialogProvider>
      <ChatProvider>
        <ChatInterfaceContent {...props} />
        <DialogContainer />
      </ChatProvider>
    </DialogProvider>
  );
};

export default ChatInterface;
