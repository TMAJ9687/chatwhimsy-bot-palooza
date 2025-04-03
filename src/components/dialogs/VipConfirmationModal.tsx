
import React, { useEffect, useRef } from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const VipConfirmationModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useUser();
  const navigatingRef = useRef(false);
  
  const isOpen = state.isOpen && state.type === 'vipConfirmation';
  
  useEffect(() => {
    if (isOpen && user) {
      // Ensure user has isVip flag set
      if (!user.isVip) {
        updateUserProfile({ isVip: true });
      }
      
      // Double check localStorage
      try {
        const userData = localStorage.getItem('chatUser');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (!parsedData.isVip) {
            parsedData.isVip = true;
            localStorage.setItem('chatUser', JSON.stringify(parsedData));
          }
        }
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }
    }
    
    // Cleanup function
    return () => {
      // If we're navigating away, explicitly set localStorage flag
      if (navigatingRef.current) {
        localStorage.removeItem('vipNavigationInProgress');
      }
    };
  }, [isOpen, user, updateUserProfile]);
  
  if (!isOpen) return null;
  
  const handleRedirectToChat = () => {
    // Close modal first
    closeModal();
    
    // Set navigating flag to prevent race conditions
    navigatingRef.current = true;
    
    // Use setTimeout to ensure modal cleanup finishes before navigation
    setTimeout(() => {
      // Ensure VIP status is set in localStorage before navigation
      if (user) {
        // VIP users should be sent to profile setup first if they haven't completed it
        const isProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
        
        if (!isProfileComplete) {
          navigate('/vip-profile');
        } else {
          // Double-check user is marked as VIP
          try {
            const userData = localStorage.getItem('chatUser');
            if (userData) {
              const parsedData = JSON.parse(userData);
              if (!parsedData.isVip) {
                parsedData.isVip = true;
                localStorage.setItem('chatUser', JSON.stringify(parsedData));
              }
            }
          } catch (e) {
            console.error('Error ensuring VIP status:', e);
          }
          
          navigate('/chat');
        }
      } else {
        navigate('/chat');
      }
    }, 50);
  };

  return (
    <Overlay
      id="vip-confirmation-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle>Subscription Confirmed!</CardTitle>
          <CardDescription>
            Your VIP membership is now active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-center">Thank you for joining our VIP program. You now have access to all premium features and benefits.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleRedirectToChat}>
            Continue to Chat
          </Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipConfirmationModal;
