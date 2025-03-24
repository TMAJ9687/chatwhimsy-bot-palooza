
import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import { useUser } from '@/context/UserContext';

const Chat = () => {
  const { clearUser } = useUser();
  
  const handleLogout = () => {
    clearUser();
  };

  return (
    <div className="min-h-screen bg-background">
      <ChatInterface onLogout={handleLogout} />
    </div>
  );
};

export default Chat;
