
import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useUser } from '@/context/UserContext';

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = () => {
  const { clearUser } = useUser();
  
  const handleLogout = () => {
    clearUser();
  };

  return <ChatInterface onLogout={handleLogout} />;
};

export default ChatPage;
