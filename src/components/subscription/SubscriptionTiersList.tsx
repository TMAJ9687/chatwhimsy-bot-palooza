
import React from 'react';
import { SubscriptionTier } from '@/types/user';
import { SubscriptionTierCard } from './SubscriptionTierCard';

interface SubscriptionPlan {
  id: SubscriptionTier;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  recommended?: boolean;
  billingCycle: string;
}

interface SubscriptionTiersListProps {
  selectedPlan: SubscriptionTier;
  onSelectPlan: (plan: SubscriptionTier) => void;
}

export const SubscriptionTiersList: React.FC<SubscriptionTiersListProps> = ({ 
  selectedPlan, 
  onSelectPlan 
}) => {
  const subscriptionTiers: SubscriptionPlan[] = [
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
      price: '$35.99',
      originalPrice: '$59.88',
      discount: '40%',
      billingCycle: 'Billed once a year',
      description: 'For our most dedicated users',
      recommended: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {subscriptionTiers.map((tier) => (
        <SubscriptionTierCard
          key={tier.id}
          tier={tier}
          isSelected={selectedPlan === tier.id}
          onSelect={() => onSelectPlan(tier.id)}
        />
      ))}
    </div>
  );
};
