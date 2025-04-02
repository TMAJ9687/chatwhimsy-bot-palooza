
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VipPaymentModal = () => {
  const { state, closeModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipPayment';
  
  if (!isOpen) return null;
  
  const handleRedirectToPayment = () => {
    closeModal();
    navigate('/vip-payment');
  };

  return (
    <Overlay
      id="vip-payment-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>VIP Payment</CardTitle>
          <CardDescription>
            Complete your VIP subscription payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Securely process your payment to activate your VIP membership and unlock all premium features.</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleRedirectToPayment}>Proceed to Payment</Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipPaymentModal;
