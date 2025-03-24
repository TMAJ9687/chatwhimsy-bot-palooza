
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, Mail } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

const VipConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  
  const handleStartVip = () => {
    closeDialog();
    // Use window.location for navigation instead of useNavigate
    window.location.href = '/vip-profile';
  };
  
  return (
    <Dialog open={state.isOpen && state.type === 'vipConfirmation'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to VIP!</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <p className="mb-4">
            Your VIP subscription has been activated successfully. You now have access to all premium features.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700 flex items-center gap-3 text-left mb-4">
            <Mail className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Confirmation Email Sent</p>
              <p className="text-xs text-muted-foreground">
                We've sent a confirmation email with your subscription details.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Your VIP features are now active</span>
            </div>
            
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Unlimited photos & voice messages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Advanced message controls & chat history</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Enhanced matching with interest-based recommendations</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleStartVip}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            Start Enjoying VIP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipConfirmationDialog;
