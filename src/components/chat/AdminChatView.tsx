
import React, { useCallback } from 'react';
import { Bot } from '@/types/chat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';

interface AdminChatViewProps {
  currentBot: Bot;
  userChats: Record<string, any[]>;
  typingBots: Record<string, boolean>;
  filteredUsers: Bot[];
  searchTerm: string;
  filters: any;
  imagesRemaining: number;
  chatHidden: boolean;
  setChatHidden: (hidden: boolean) => void;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (imageDataUrl: string) => void;
  handleSendVoiceMessage: (voiceDataUrl: string, duration: number) => void;
  selectUser: (user: Bot) => void;
  setSearchTerm: (term: string) => void;
  handleFilterChange: (filters: any) => void;
  isUserBlocked: (userId: string) => boolean;
}

const AdminChatView: React.FC<AdminChatViewProps> = ({
  currentBot,
  userChats,
  typingBots,
  filteredUsers,
  searchTerm,
  filters,
  imagesRemaining,
  chatHidden,
  setChatHidden,
  handleBlockUser,
  handleUnblockUser,
  handleSendTextMessage,
  handleSendImageMessage,
  handleSendVoiceMessage,
  selectUser,
  setSearchTerm,
  handleFilterChange,
  isUserBlocked,
}) => {
  const isCurrentUserBlocked = isUserBlocked(currentBot.id);
  
  const handleCompletelyCloseChat = useCallback(() => {
    setChatHidden(true);
  }, [setChatHidden]);

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
};

export default AdminChatView;
