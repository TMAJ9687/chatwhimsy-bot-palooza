
import React, { useCallback } from 'react';
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

// Main component that uses our new dialog context
const ChatInterfaceContent: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  
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
    handleNotificationRead
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header with icons */}
      <ChatAppHeader 
        unreadCount={unreadCount}
        onOpenInbox={handleOpenInbox}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - User list (desktop) */}
        <div className="hidden md:flex flex-col w-[350px] bg-white border-r border-gray-200 overflow-hidden">
          <UserList 
            users={filteredUsers}
            currentUserId={currentBot.id}
            onSelectUser={selectUser}
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
          currentUserId={currentBot.id}
          onSelectUser={selectUser}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat header component */}
          <ChatHeader 
            currentUser={currentBot}
            onBlockUser={handleBlockUser}
            onCloseChat={handleCloseChat}
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
