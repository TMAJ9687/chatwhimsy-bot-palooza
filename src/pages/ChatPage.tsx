
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/chat/ChatInterface';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/hooks/useLogout';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { useToast } from '@/hooks/use-toast';

const ChatPage = () => {
  const navigate = useNavigate();
  const { performLogout } = useLogout();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Use the idle detection hook - standard users get 30 minutes, VIP users get 2 hours
  const idleTimeoutMinutes = user?.isVip ? 120 : 30;
  const { isIdle } = useIdleDetection({
    timeoutInMinutes: idleTimeoutMinutes,
    reconnectTimeoutInMinutes: 30,
    onIdle: () => {
      console.log('User is idle, redirecting to reconnect page');
    }
  });
  
  // Handle logout from header
  const handleLogout = () => {
    performLogout();
  };

  // Inform user about idle detection on component mount
  useEffect(() => {
    const timeoutMinutes = user?.isVip ? 120 : 30;
    
    // Show toast once on mount
    toast({
      title: "Idle Detection Active",
      description: `Your session will pause after ${timeoutMinutes} minutes of inactivity.`,
      duration: 5000
    });
  }, [user?.isVip, toast]);
  
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface onLogout={handleLogout} />
    </div>
  );
};

export default ChatPage;
