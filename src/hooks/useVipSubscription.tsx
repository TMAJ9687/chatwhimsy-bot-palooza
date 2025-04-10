
import { useCallback } from 'react';
import { SubscriptionTier, UserProfile } from '@/types/user';
import { redirectToVipSubscription } from '@/utils/vipRedirect';

export const useVipSubscription = (
  updateUserProfile: (profile: Partial<UserProfile>) => void
) => {
  const subscribeToVip = useCallback((tier: SubscriptionTier) => {
    // First attempt to redirect to subscription page
    const redirected = redirectToVipSubscription(tier);
    
    // If redirect fails (or we're in development), proceed with instant upgrade
    if (!redirected) {
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
    }
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
