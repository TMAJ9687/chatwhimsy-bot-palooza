import React, { useCallback } from 'react';
import { Bot } from '@/types/chat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import VipUpgradeSection from './VipUpgradeSection';
import NotificationSidebar from './NotificationSidebar';
import EmptyChatState from './EmptyChatState';
import ChatAppHeader from './ChatAppHeader';

interface RegularChatViewProps {
  currentBot: Bot;
  userChats: Record<string, any[]>;
  typingBots: Record<string, boolean>;
  filteredUsers: Bot[];
  searchTerm: string;
  filters: any;
  imagesRemaining: number;
  chatHidden: boolean;
  setChatHidden: (hidden: boolean) => void;
  showInbox: boolean;
  showHistory: boolean;
  setShowInbox: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  unreadNotifications: any[];
  chatHistory: any[];
  unreadCount: number;
  isVip: boolean;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (imageDataUrl: string) => void;
  handleSendVoiceMessage: (voiceDataUrl: string, duration: number) => void;
  selectUser: (user: Bot) => void;
  setSearchTerm: (term: string) => void;
  handleFilterChange: (filters: any) => void;
  handleNotificationRead: (id: string) => void;
  isUserBlocked: (userId: string) => boolean;
  handleOpenInbox: () => void;
  handleOpenHistory: () => void;
  handleLogout: () => void;
}

const RegularChatView: React.FC<RegularChatViewProps> = ({
  currentBot,
  userChats,
  typingBots,
  filteredUsers,
  searchTerm,
  filters,
  imagesRemaining,
  chatHidden,
  setChatHidden,
  showInbox,
  showHistory,
  setShowInbox,
  setShowHistory,
  unreadNotifications,
  chatHistory,
  unreadCount,
  isVip,
  handleBlockUser,
  handleUnblockUser,
  handleSendTextMessage,
  handleSendImageMessage,
  handleSendVoiceMessage,
  selectUser,
  setSearchTerm,
  handleFilterChange,
  handleNotificationRead,
  isUserBlocked,
  handleOpenInbox,
  handleOpenHistory,
  handleLogout,
}) => {
  const isCurrentUserBlocked = isUserBlocked(currentBot.id);
  
  const handleCompletelyCloseChat = useCallback(() => {
    setChatHidden(true);
  }, [setChatHidden]);

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

export default RegularChatView;
