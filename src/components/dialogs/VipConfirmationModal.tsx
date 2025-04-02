
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const VipConfirmationModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipConfirmation';
  
  if (!isOpen) return null;
  
  const handleGoToChat = () => {
    closeModal();
    navigate('/chat');
  };

  const handleSetupProfile = () => {
    closeModal();
    navigate('/vip-profile');
  };

  return (
    <Overlay
      id="vip-confirmation-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Welcome to VIP!</CardTitle>
          <CardDescription>
            Your VIP membership is now active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-center">Thank you for becoming a VIP member. You now have access to all premium features.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleSetupProfile} className="w-full">Complete Your Profile</Button>
          <Button variant="outline" onClick={handleGoToChat} className="w-full">Start Chatting</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipConfirmationModal;
