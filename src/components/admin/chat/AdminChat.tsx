
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import ChatInterface from '@/components/chat/ChatInterface';
import AdminChatButton from './AdminChatButton';
import AdminChatSidebar from './AdminChatSidebar';
import { useAdminChat } from '@/hooks/admin/useAdminChat';

interface AdminChatProps {
  fixedPosition?: boolean;
}

/**
 * Admin chat component that provides a chat sidebar in the admin dashboard
 */
const AdminChat: React.FC<AdminChatProps> = ({ fixedPosition = true }) => {
  const { isChatOpen, openChat, closeChat } = useAdminChat();
  const { isAdmin } = useAdmin();
  
  // Don't render if not an admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      {/* Chat button in a fixed position or inline */}
      {fixedPosition ? (
        <div className="fixed bottom-6 right-6 z-40">
          <AdminChatButton onClick={openChat} />
        </div>
      ) : (
        <div className="my-4">
          <AdminChatButton onClick={openChat} />
        </div>
      )}
      
      {/* Admin Chat Sidebar */}
      <AdminChatSidebar isOpen={isChatOpen} onClose={closeChat}>
        <ChatInterface adminView={true} onLogout={() => {}} />
      </AdminChatSidebar>
    </>
  );
};

export default AdminChat;
