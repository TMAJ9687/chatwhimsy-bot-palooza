
import React from 'react';
import { SubscriptionTier } from '@/types/user';

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

interface SubscriptionTierCardProps {
  tier: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}

export const SubscriptionTierCard: React.FC<SubscriptionTierCardProps> = ({
  tier,
  isSelected,
  onSelect
}) => {
  return (
    <div 
      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
          : 'hover:border-amber-200 hover:bg-amber-50/20 dark:hover:bg-amber-950/5'
      }`}
      onClick={onSelect}
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
  );
};
