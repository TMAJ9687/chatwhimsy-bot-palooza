
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const VipConfirmationModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipConfirmation';
  
  if (!isOpen) return null;
  
  const handleRedirectToChat = () => {
    closeModal();
    navigate('/chat');
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
