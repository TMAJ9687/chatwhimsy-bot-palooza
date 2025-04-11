
import React from 'react';
import { SubscriptionTier } from '@/types/user';

interface PaymentSummaryProps {
  selectedPlan: SubscriptionTier;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ selectedPlan }) => {
  const getPlanDetails = (plan: SubscriptionTier) => {
    switch(plan) {
      case 'monthly':
        return { 
          name: 'Monthly VIP Subscription', 
          price: '$4.99', 
          billing: 'Billed every month'
        };
      case 'semiannual':
        return { 
          name: 'Semi-Annual VIP Subscription', 
          price: '$24.95', 
          billing: 'Billed every six months'
        };
      case 'annual':
        return { 
          name: 'Annual VIP Subscription', 
          price: '$35.99', 
          billing: 'Billed once a year'
        };
      default:
        return { 
          name: 'Monthly VIP Subscription', 
          price: '$4.99', 
          billing: 'Billed every month'
        };
    }
  };

  const planDetails = getPlanDetails(selectedPlan);

  return (
    <div className="bg-muted/50 p-4 rounded-lg my-4">
      <div className="font-medium">{planDetails.name}</div>
      <div className="text-lg font-bold">{planDetails.price}</div>
      <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
    </div>
  );
};
