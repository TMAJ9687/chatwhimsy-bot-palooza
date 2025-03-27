
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, LogIn } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

const VipSelectDialog = () => {
  const { state, closeDialog } = useDialog();
  const { updateUserProfile } = useUser();
  const { toast } = useToast();

  const handleLoginClick = () => {
    closeDialog();
    // Use window.location instead of navigate
    window.location.href = '/vip-login';
  };

  const handleSignupClick = () => {
    closeDialog();
    // Now redirect to the VIP Subscription page to select a plan first
    window.location.href = '/vip-subscription';
  };

  const handleActivateTestVip = () => {
    // Activate test VIP status
    updateUserProfile({
      isVip: true,
      subscriptionTier: 'monthly',
      subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      imagesRemaining: Infinity
    });
    
    toast({
      title: "VIP Access Granted",
      description: "Test VIP account has been activated. You now have access to all VIP features.",
      duration: 3000
    });
    
    closeDialog();
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipSelect'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl">VIP Access</DialogTitle>
          <DialogDescription className="text-center">
            Choose an option to access VIP features
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Button
            onClick={handleLoginClick}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <LogIn className="h-4 w-4 mr-2" />
            VIP Login
          </Button>
          
          <Button
            onClick={handleSignupClick}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="h-4 w-4 mr-2" />
            Become VIP
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                For testing
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleActivateTestVip}
            variant="outline"
            className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800"
          >
            Activate Test VIP Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipSelectDialog;
