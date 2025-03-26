
import { useCallback } from 'react';
import { SubscriptionTier, UserProfile } from '@/types/user';

export const useVipSubscription = (
  updateUserProfile: (profile: Partial<UserProfile>) => void
) => {
  const subscribeToVip = useCallback((tier: SubscriptionTier) => {
    let endDate = new Date();
    
    switch(tier) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'semiannual':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        break;
    }
    
    updateUserProfile({ 
      isVip: true, 
      subscriptionTier: tier,
      subscriptionEndDate: endDate,
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity
    });
  }, [updateUserProfile]);
  
  const cancelVipSubscription = useCallback(() => {
    updateUserProfile({ 
      isVip: false, 
      subscriptionTier: 'none',
      subscriptionEndDate: undefined,
      imagesRemaining: 15,
      voiceMessagesRemaining: 0
    });
  }, [updateUserProfile]);

  return {
    subscribeToVip,
    cancelVipSubscription
  };
};
