
import React from 'react';
import { Bot, Message } from '@/types/chat';
import UserActions from './UserActions';
import { useUser } from '@/context/UserContext';

interface ChatHeaderProps {
  currentUser: Bot;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onDeleteConversation: (userId: string) => void;
  onCloseChat: () => void;
  isVip?: boolean;
  messages?: Message[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  currentUser,
  onBlockUser,
  onUnblockUser,
  onDeleteConversation,
  onCloseChat,
  isVip = false,
  messages = []
}) => {
  const { isUserBlocked } = useUser();
  const isBlocked = isUserBlocked ? isUserBlocked(currentUser.id) : false;
  
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
      <div className="flex items-center">
        <div className="relative">
          <img 
            src={currentUser.avatar || '/placeholder.svg'} 
            alt={currentUser.name} 
            className="w-9 h-9 rounded-full object-cover" 
          />
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
        </div>
        <div className="ml-3">
          <div className="font-semibold text-gray-900 dark:text-gray-100">{currentUser.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
        </div>
      </div>
      
      <UserActions 
        userId={currentUser.id}
        userName={currentUser.name}
        isBlocked={isBlocked}
        isVip={isVip}
        messages={messages}
        onBlockUser={onBlockUser}
        onUnblockUser={onUnblockUser}
        onDeleteConversation={onDeleteConversation}
        onCloseChat={onCloseChat}
      />
    </div>
  );
};

export default ChatHeader;
