
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import ChatInterface from '@/components/chat/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Admin chat component that provides a chat interface in the admin dashboard
 */
const AdminChatManager: React.FC = () => {
  const { isAdmin } = useAdmin();
  
  // Don't render if not an admin
  if (!isAdmin) {
    return null;
  }
  
  return <ChatInterface adminView={true} onLogout={() => {}} />;
};

export default AdminChatManager;
