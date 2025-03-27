
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, LogIn, User } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

const VipSelectDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const { updateUserProfile, subscribeToVip } = useUser();
  const { toast } = useToast();

  const handleLoginClick = () => {
    closeDialog();
    openDialog('vipLogin');
  };

  const handleSignupClick = () => {
    closeDialog();
    // Now redirect to the VIP Subscription page to select a plan first
    window.location.href = '/vip-subscription';
  };
  
  // Quick test login function
  const handleTestAccountLogin = () => {
    // Set up VIP test account
    updateUserProfile({
      nickname: 'test',
      email: 'test@vip.com',
      isVip: true,
      subscriptionTier: 'monthly',
      subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity
    });
    
    // Also call the subscribe function to ensure all VIP features are enabled
    subscribeToVip('monthly');
    
    toast({
      title: "VIP Test Account Activated",
      description: "You now have access to all VIP features for testing",
    });
    
    closeDialog();
    
    // Reload the page to refresh with new VIP status
    window.location.reload();
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
        </div>
        
        <DialogFooter className="flex flex-col items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-muted-foreground mb-2">For testing purposes only:</div>
          <Button
            onClick={handleTestAccountLogin}
            variant="link"
            className="text-amber-500"
            size="sm"
          >
            <User className="h-3 w-3 mr-1" />
            Activate Test VIP Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipSelectDialog;
