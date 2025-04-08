
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdleDetectionService } from '@/services/idle/IdleDetectionService';
import { useToast } from './use-toast';
import { useUser } from '@/context/UserContext';

interface IdleDetectionOptions {
  timeoutInMinutes?: number;
  reconnectTimeoutInMinutes?: number;
  redirectPath?: string;
  onIdle?: () => void;
}

export const useIdleDetection = ({
  timeoutInMinutes = 30,
  reconnectTimeoutInMinutes = 30,
  redirectPath = '/reconnect',
  onIdle
}: IdleDetectionOptions = {}) => {
  const [idleService, setIdleService] = useState<IdleDetectionService | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [reconnectExpired, setReconnectExpired] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clearUser } = useUser();
  
  // Initialize the idle service
  useEffect(() => {
    if (!user) return; // Don't track if no user is logged in
    
    // Create a handler for when user becomes idle
    const handleUserIdle = () => {
      console.log('User is idle, redirecting to reconnect page');
      setIsIdle(true);
      
      // Call the onIdle callback if provided
      if (onIdle) onIdle();
      
      // Store user data for the reconnect page
      localStorage.setItem('reconnectUser', JSON.stringify({
        userId: user.id,
        name: user.name,
        email: user.email,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + reconnectTimeoutInMinutes * 60 * 1000).toISOString()
      }));
      
      // Redirect to reconnect page
      navigate(redirectPath);
    };
    
    // Create and start the idle service
    const service = new IdleDetectionService(timeoutInMinutes, handleUserIdle);
    service.start();
    setIdleService(service);
    
    // Toast notification to inform user about idle timeout
    toast({
      title: "Idle Detection Active",
      description: `You'll be redirected after ${timeoutInMinutes} minutes of inactivity.`,
      duration: 5000
    });
    
    return () => {
      // Clean up service when component unmounts
      if (service) {
        service.stop();
      }
    };
  }, [timeoutInMinutes, reconnectTimeoutInMinutes, redirectPath, navigate, toast, user, onIdle]);
  
  // Function to handle user reconnection
  const handleReconnect = useCallback(() => {
    setIsIdle(false);
    
    // Remove reconnect data
    localStorage.removeItem('reconnectUser');
    
    // Navigate back to home
    navigate('/');
    
    // Show confirmation toast
    toast({
      title: "Welcome back!",
      description: "Your session has been restored.",
      duration: 3000
    });
  }, [navigate, toast]);
  
  // Function to handle session expiration
  const handleSessionExpired = useCallback(() => {
    setReconnectExpired(true);
    
    // Clear all user data
    clearUser();
    localStorage.removeItem('reconnectUser');
    
    // Navigate to feedback page
    navigate('/feedback');
    
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity.",
      variant: "destructive",
      duration: 5000
    });
  }, [navigate, toast, clearUser]);
  
  return { 
    isIdle, 
    reconnectExpired, 
    handleReconnect, 
    handleSessionExpired 
  };
};
