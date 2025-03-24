
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

const VipSelectDialog = () => {
  const { state, closeDialog } = useDialog();

  const handleLoginClick = () => {
    closeDialog();
    // Use window.location instead of navigate
    window.location.href = '/vip-login';
  };

  const handleSignupClick = () => {
    closeDialog();
    // Use window.location instead of navigate
    window.location.href = '/vip-signup';
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
      </DialogContent>
    </Dialog>
  );
};

export default VipSelectDialog;
