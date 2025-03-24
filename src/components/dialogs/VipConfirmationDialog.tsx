
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/context/DialogContext';
import { Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VipConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const navigate = useNavigate();

  const handleContinueToProfile = () => {
    closeDialog();
    navigate('/vip-profile');
  };

  const handleBackToChat = () => {
    closeDialog();
    navigate('/chat');
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipConfirmation'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
          <DialogDescription>
            Your VIP subscription has been activated successfully
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">VIP Status Active</h3>
              <p className="text-sm text-muted-foreground">All premium features are now available</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <h4 className="font-medium">You now have access to:</h4>
          <ul className="space-y-2">
            {[
              'Unlimited photo sharing',
              'Message status indicators',
              'Typing indicators',
              'Ad-free experience',
              'Priority customer support'
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            onClick={handleContinueToProfile}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Continue to Profile Setup
          </Button>
          <Button 
            onClick={handleBackToChat}
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Back to Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipConfirmationDialog;
