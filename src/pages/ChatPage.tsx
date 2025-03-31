
import React from 'react';
import { useParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { botId } = useParams();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
      <p>Chatting with bot ID: {botId}</p>
    </div>
  );
};

export default ChatPage;
