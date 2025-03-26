
import React, { memo } from 'react';
import { useChat } from '@/context/ChatContext';
import UserAvatar from './UserAvatar';
import UserInfo from './UserInfo';
import UserActions from './UserActions';

interface ChatHeaderProps {
  currentUser: {
    id: string;
    name: string;
    age: number;
    gender: string;
    country: string;
    countryCode: string;
    vip: boolean;
  };
  onBlockUser: (userId: string) => void;
  onCloseChat: () => void;
}

// Optimized component with memoization
const ChatHeader: React.FC<ChatHeaderProps> = memo(({ 
  currentUser, 
  onBlockUser, 
  onCloseChat 
}) => {
  const { isUserBlocked, handleUnblockUser, userChats, handleDeleteConversation, isVip } = useChat();
  
  // Check if current user is blocked
  const isBlocked = isUserBlocked(currentUser.id);
  const currentUserMessages = userChats[currentUser.id] || [];
  
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
      <div className="flex items-center">
        <UserAvatar 
          name={currentUser.name} 
          isVip={currentUser.vip} 
        />
        
        <UserInfo 
          name={currentUser.name}
          age={currentUser.age}
          gender={currentUser.gender}
          country={currentUser.country}
          countryCode={currentUser.countryCode}
          isVip={currentUser.vip}
        />
      </div>
      
      <UserActions 
        userId={currentUser.id}
        userName={currentUser.name}
        isBlocked={isBlocked}
        isVip={isVip}
        messages={currentUserMessages}
        onBlockUser={onBlockUser}
        onUnblockUser={handleUnblockUser}
        onDeleteConversation={handleDeleteConversation}
        onCloseChat={onCloseChat}
      />
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
