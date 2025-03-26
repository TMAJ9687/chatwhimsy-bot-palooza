
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { SubscriptionTiersList } from '@/components/subscription/SubscriptionTiersList';
import { SubscriptionBenefits } from '@/components/subscription/SubscriptionBenefits';
import { SubscriptionTier } from '@/types/user';

const VipSubscriptionDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('monthly' as SubscriptionTier);

  const handleContinue = () => {
    closeDialog();
    openDialog('vipPayment', { selectedPlan });
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipSubscription'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-xl mt-4">Choose Your VIP Plan</DialogTitle>
          <p className="text-muted-foreground mt-2">
            Unlock all premium features and enhance your experience
          </p>
        </DialogHeader>

        <SubscriptionTiersList 
          selectedPlan={selectedPlan} 
          onSelectPlan={setSelectedPlan} 
        />

        <SubscriptionBenefits />
        
        <DialogFooter className="mt-6">
          <Button
            onClick={handleContinue}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            Continue to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipSubscriptionDialog;
