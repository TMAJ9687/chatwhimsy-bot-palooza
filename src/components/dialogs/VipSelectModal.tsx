
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const VipSelectModal = () => {
  const { state, closeModal, openModal } = useModal();
  const navigate = useNavigate();
  
  const isOpen = state.isOpen && state.type === 'vipSelect';
  
  if (!isOpen) return null;
  
  const handleSignUp = () => {
    closeModal();
    navigate('/vip-signup');
  };

  const handleLogin = () => {
    closeModal();
    navigate('/vip-login');
  };

  const handleViewSubscriptions = () => {
    closeModal();
    openModal('vipSubscription');
  };

  return (
    <Overlay
      id="vip-select-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-2">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle>VIP Membership</CardTitle>
          <CardDescription>
            Enhance your experience with premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-center">Join our VIP program to unlock exclusive features and premium benefits.</p>
          
          <div className="grid gap-3 mt-4">
            <Button onClick={handleSignUp} className="bg-amber-500 hover:bg-amber-600">
              Sign Up as VIP
            </Button>
            <Button onClick={handleLogin} variant="outline">
              Already a VIP? Login
            </Button>
            <Button onClick={handleViewSubscriptions} variant="ghost">
              View Subscription Plans
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={closeModal} className="text-sm text-muted-foreground">
            Maybe Later
          </Button>
        </CardFooter>
      </Card>
    </Overlay>
  );
};

export default VipSelectModal;
