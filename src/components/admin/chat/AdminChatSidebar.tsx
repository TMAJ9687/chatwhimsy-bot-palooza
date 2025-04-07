
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';

interface AdminChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminChatSidebar: React.FC<AdminChatSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Use full height and slide from the right
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 bg-background shadow-xl flex flex-col transition-transform duration-300 ease-in-out transform">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-bold text-xl">Admin Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatProvider>
          <ChatInterface onLogout={() => {}} adminView={true} />
        </ChatProvider>
      </div>
    </div>
  );
};

export default AdminChatSidebar;
