
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import ChatAppHeader from './ChatAppHeader';
import NotificationSidebar from './NotificationSidebar';
import EmptyChatState from './EmptyChatState';
import { Message } from '@/types/chat';

interface ChatInterfaceProps {
  onLogout: () => void;
}

// Main component that uses our new dialog context
const ChatInterfaceContent: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user, isVip } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [chatHidden, setChatHidden] = useState(true); // Set to true by default
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const {
    userChats,
    imagesRemaining,
    voiceMessagesRemaining,
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
    handleSendGifMessage,
    handleDeleteConversation,
    selectUser,
    handleFilterChange,
    handleNotificationRead,
    isUserBlocked
  } = useChat();

  // VIP message action handlers
  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);
  
  const handleReact = useCallback((messageId: string, reaction: string) => {
    // In a real app, this would store the reaction in the database
    console.log(`Reacted with ${reaction} to message ${messageId}`);
  }, []);
  
  const handleUnsend = useCallback((messageId: string) => {
    // In a real app, this would remove the message from the chat
    console.log(`Unsending message ${messageId}`);
  }, []);
  
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Show site rules dialog after 3 seconds, but only if rules haven't been accepted yet
  // and the user is NOT a VIP
  React.useEffect(() => {
    // Only show the dialog if rules haven't been accepted yet and user is not VIP
    if (!rulesAccepted && !isVip) {
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
  }, [openDialog, rulesAccepted, setRulesAccepted, isVip]);

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

  // Check if current user is blocked
  const isCurrentUserBlocked = isUserBlocked(currentBot.id);
  
  // Handle completely closing chat
  const handleCompletelyCloseChat = useCallback(() => {
    setChatHidden(true);
  }, []);

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
                onUnblockUser={handleUnblockUser}
                onDeleteConversation={handleDeleteConversation}
                onCloseChat={handleCompletelyCloseChat}
                isVip={isVip}
                messages={userChats[currentBot.id] || []}
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
                onReply={isVip ? handleReply : undefined}
                onReact={isVip ? handleReact : undefined}
                onUnsend={isVip ? handleUnsend : undefined}
              />
              
              {/* Message input component */}
              <MessageInputBar
                onSendMessage={handleSendTextMessage}
                onSendImage={handleSendImageMessage}
                onSendVoiceMessage={isVip ? handleSendVoiceMessage : undefined}
                onSendGif={isVip ? handleSendGifMessage : undefined}
                imagesRemaining={imagesRemaining}
                voiceMessagesRemaining={voiceMessagesRemaining}
                disabled={isCurrentUserBlocked}
                userType={isVip ? 'vip' : 'standard'}
                replyTo={replyingTo}
                onCancelReply={handleCancelReply}
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

// Create a wrapper component that provides the chat context
const ChatInterface: React.FC<ChatInterfaceProps> = (props) => {
  return (
    <ChatProvider>
      <ChatInterfaceContent {...props} />
    </ChatProvider>
  );
};

export default ChatInterface;
