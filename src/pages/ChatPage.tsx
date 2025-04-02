
import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 dark:from-gray-900 dark:to-gray-800/50">
      <ChatInterface />
    </div>
  );
};

export default ChatPage;
