
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VipSelectModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipSelect';
  
  if (!isOpen) return null;
  
  const handleViewPlans = () => {
    closeModal();
    navigate('/vip-subscription');
  };

  return (
    <Overlay
      id="vip-select-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Become a VIP Member</CardTitle>
          <CardDescription>
            Choose a VIP plan to unlock premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Upgrade to VIP to unlock premium features like unlimited messages, photo sharing, and more.</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>Not Now</Button>
          <Button onClick={handleViewPlans}>View Plans</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipSelectModal;
