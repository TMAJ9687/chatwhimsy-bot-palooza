
import React from 'react';
import { useVipPricing } from '@/hooks/useVipPricing';
import { Skeleton } from '@/components/ui/skeleton';

interface VipPricingDisplayProps {
  plan: 'monthly' | 'semiannual' | 'annual';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const VipPricingDisplay: React.FC<VipPricingDisplayProps> = ({ 
  plan, 
  showLabel = true, 
  size = 'medium' 
}) => {
  const { monthlyPrice, semiannualPrice, annualPrice, loading, error } = useVipPricing();
  
  const getSkeletonClass = () => {
    switch(size) {
      case 'small': return 'h-4 w-14';
      case 'large': return 'h-8 w-24';
      default: return 'h-6 w-20';
    }
  };
  
  const getFontClass = () => {
    switch(size) {
      case 'small': return 'text-sm';
      case 'large': return 'text-2xl';
      default: return 'text-base';
    }
  };
  
  if (loading) {
    return <Skeleton className={getSkeletonClass()} />;
  }
  
  if (error) {
    console.warn('VipPricingDisplay error:', error);
    // Fallback to showing the price anyway from the hook's default
  }
  
  const getPriceByPlan = () => {
    switch (plan) {
      case 'monthly':
        return monthlyPrice;
      case 'semiannual':
        return semiannualPrice;
      case 'annual':
        return annualPrice;
      default:
        return '--';
    }
  };
  
  const getLabel = () => {
    switch (plan) {
      case 'monthly':
        return 'per month';
      case 'semiannual':
        return 'every 6 months';
      case 'annual':
        return 'per year';
      default:
        return '';
    }
  };
  
  return (
    <span className={`font-medium ${getFontClass()}`}>
      {getPriceByPlan()}
      {showLabel && <span className="text-sm text-muted-foreground ml-1">{getLabel()}</span>}
    </span>
  );
};

export default VipPricingDisplay;
