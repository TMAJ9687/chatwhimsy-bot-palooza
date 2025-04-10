
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTier, UserProfile } from '@/types/user';
import { redirectToVipSubscription } from '@/utils/vipRedirect';

export const useVipSubscription = (
  updateUserProfile: (profile: Partial<UserProfile>) => void
) => {
  const navigate = useNavigate();
  
  const subscribeToVip = useCallback((tier: SubscriptionTier) => {
    // Use React Router navigation for redirection
    const redirected = redirectToVipSubscription(tier, navigate);
    
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
  }, [navigate, updateUserProfile]);
  
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
