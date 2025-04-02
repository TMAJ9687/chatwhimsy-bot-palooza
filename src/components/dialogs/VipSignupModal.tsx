
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VipSignupModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipSignup';
  
  if (!isOpen) return null;
  
  const handleRedirectToSignup = () => {
    closeModal();
    navigate('/vip-signup');
  };

  return (
    <Overlay
      id="vip-signup-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>VIP Signup</CardTitle>
          <CardDescription>
            Create your VIP account to access premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Become a VIP member to unlock premium features and enhance your experience.</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleRedirectToSignup}>Sign Up</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipSignupModal;
