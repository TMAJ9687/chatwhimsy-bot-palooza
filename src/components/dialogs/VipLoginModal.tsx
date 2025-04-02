
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VipLoginModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipLogin';
  
  if (!isOpen) return null;
  
  const handleRedirectToLogin = () => {
    closeModal();
    navigate('/vip-login');
  };

  return (
    <Overlay
      id="vip-login-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>VIP Login</CardTitle>
          <CardDescription>
            Please login to access VIP features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You need to login to your VIP account to access premium features.</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleRedirectToLogin}>Login</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipLoginModal;
