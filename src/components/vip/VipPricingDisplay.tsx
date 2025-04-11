
import React from 'react';
import { useVipPricing } from '@/hooks/useVipPricing';
import { Skeleton } from '@/components/ui/skeleton';

interface VipPricingDisplayProps {
  plan: 'monthly' | 'semiannual' | 'annual';
  showLabel?: boolean;
}

const VipPricingDisplay: React.FC<VipPricingDisplayProps> = ({ plan, showLabel = true }) => {
  const { monthlyPrice, semiannualPrice, annualPrice, loading } = useVipPricing();
  
  if (loading) {
    return <Skeleton className="h-6 w-20" />;
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
    <span className="font-medium">
      {getPriceByPlan()}
      {showLabel && <span className="text-sm text-muted-foreground ml-1">{getLabel()}</span>}
    </span>
  );
};

export default VipPricingDisplay;
