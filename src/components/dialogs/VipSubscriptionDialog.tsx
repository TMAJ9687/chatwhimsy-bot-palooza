
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
import { useUser } from '@/context/UserContext';

type SubscriptionTier = {
  id: 'monthly' | 'semiannual' | 'annual';
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  recommended?: boolean;
  billingCycle: string;
};

const VipSubscriptionDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>('monthly');
  
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'monthly',
      title: 'Monthly',
      price: '$4.99',
      billingCycle: 'Billed every month',
      description: 'Great for trying out VIP features'
    },
    {
      id: 'semiannual',
      title: 'Semi-Annual',
      price: '$24.95',
      originalPrice: '$29.94',
      discount: '16%',
      billingCycle: 'Billed every six months',
      description: 'Best for regular users'
    },
    {
      id: 'annual',
      title: 'Annual',
      price: '$39.99',
      originalPrice: '$59.88',
      discount: '33%',
      billingCycle: 'Billed once a year',
      description: 'For our most dedicated users',
      recommended: true
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {subscriptionTiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === tier.id 
                  ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
                  : 'hover:border-amber-200 hover:bg-amber-50/20 dark:hover:bg-amber-950/5'
              }`}
              onClick={() => setSelectedPlan(tier.id)}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className={`p-2 ${tier.recommended ? 'pt-4' : ''}`}>
                <h3 className="font-semibold text-lg">{tier.title}</h3>
                <p className="text-muted-foreground text-sm">{tier.billingCycle}</p>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold">{tier.price}</div>
                  {tier.originalPrice && (
                    <div className="text-xs text-muted-foreground">
                      <span className="line-through mr-1">{tier.originalPrice}</span>
                      Save {tier.discount}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  {tier.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="border-t pt-4">
            <h3 className="font-medium text-lg mb-3">VIP Benefits</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Send unlimited photos',
                'Send unlimited voice messages',
                'Chat history view',
                'Find matches by interests',
                'Customer Support',
                'Customized avatars',
                'Appear at top of the list',
                'Ad free experience'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
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
