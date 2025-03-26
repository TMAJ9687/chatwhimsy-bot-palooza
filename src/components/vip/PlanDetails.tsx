
import React from 'react';

export type SubscriptionTier = 'monthly' | 'semiannual' | 'annual';

export interface PlanInfo {
  name: string;
  price: string;
  billing: string;
  tier: SubscriptionTier;
}

export const getPlanDetails = (plan: string): PlanInfo => {
  switch(plan) {
    case 'monthly':
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly'
      };
    case 'semiannual':
      return { 
        name: 'Semi-Annual VIP Subscription', 
        price: '$24.99', 
        billing: 'Billed every six months',
        tier: 'semiannual'
      };
    case 'annual':
      return { 
        name: 'Annual VIP Subscription', 
        price: '$35.99', 
        billing: 'Billed once a year',
        tier: 'annual'
      };
    default:
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly'
      };
  }
};

const PlanDetails: React.FC<{ selectedPlan: string }> = ({ selectedPlan }) => {
  const planDetails = getPlanDetails(selectedPlan);
  
  return (
    <div className="mx-4 bg-muted/50 p-3 rounded-lg my-2">
      <div className="font-medium">{planDetails.name}</div>
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">{planDetails.price}</div>
        <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
      </div>
    </div>
  );
};

export default PlanDetails;
