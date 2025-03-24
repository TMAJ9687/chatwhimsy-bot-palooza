
import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { checkDeviceRegistration, updateLastActiveTime } from '@/utils/deviceUtils';

const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    addUserDevice, 
    clearUser, 
    userActivity,
    isVip,
    isAdmin
  } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handle device registration
  useEffect(() => {
    if (user) {
      const deviceId = checkDeviceRegistration();
      const canUseDevice = addUserDevice(deviceId);
      
      if (!canUseDevice) {
        toast({
          title: "Device Limit Reached",
          description: isVip 
            ? "You've reached the maximum of 2 devices for VIP accounts." 
            : "Standard accounts are limited to 1 device.",
          variant: "destructive",
        });
        
        // Log user out
        clearUser();
        navigate('/');
      }
    }
  }, [user, addUserDevice, navigate, clearUser, toast, isVip]);
  
  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      userActivity();
      updateLastActiveTime();
    };
    
    // Register event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Set initial activity time
    handleActivity();
    
    return () => {
      // Clean up event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [userActivity]);
  
  // Display VIP/Admin badge for VIP and Admin users
  const userBadge = isVip || isAdmin ? (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center shadow-lg ${
        isAdmin ? 'bg-purple-600' : 'bg-amber-500'
      }`}>
        {isAdmin ? 'Admin' : 'VIP'}
      </div>
    </div>
  ) : null;
  
  return (
    <>
      {children}
      {userBadge}
    </>
  );
};

export default SessionManager;
