
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VipSubscriptionModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipSubscription';
  
  if (!isOpen) return null;
  
  const handleRedirectToSubscription = () => {
    closeModal();
    navigate('/vip-subscription');
  };

  return (
    <Overlay
      id="vip-subscription-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>VIP Subscription</CardTitle>
          <CardDescription>
            Choose a subscription plan to become a VIP member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Select a subscription plan that works best for you and unlock all premium features.</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleRedirectToSubscription}>View Plans</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipSubscriptionModal;
