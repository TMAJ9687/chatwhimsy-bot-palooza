
import { SubscriptionTier } from '@/types/user';

/**
 * Redirect users to the VIP subscription page based on the tier they selected
 * 
 * @param tier The subscription tier selected
 * @param testing Optional flag to enable testing mode
 * @returns True if redirect was successful, false otherwise
 */
export const redirectToVipSubscription = (tier: SubscriptionTier, testing?: boolean): boolean => {
  try {
    // Get the appropriate URL based on the subscription tier
    let redirectUrl = '';
    
    switch(tier) {
      case 'monthly':
        redirectUrl = '/subscribe/monthly';
        break;
      case 'semiannual':
        redirectUrl = '/subscribe/semiannual';
        break;
      case 'annual':
        redirectUrl = '/subscribe/annual';
        break;
      default:
        redirectUrl = '/subscribe';
    }
    
    // In testing mode, just log the URL
    if (testing) {
      console.log('Redirecting to VIP subscription page:', redirectUrl);
      return true;
    }
    
    // Add a small delay for better UX
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 300);
    
    return true;
  } catch (error) {
    console.error('Error redirecting to VIP subscription page:', error);
    return false;
  }
};

/**
 * Check if the current URL is a VIP subscription page
 */
export const isVipSubscriptionPage = (): boolean => {
  const path = window.location.pathname;
  return path.startsWith('/subscribe');
};

/**
 * Extract tier from URL if on a subscription page
 */
export const getTierFromUrl = (): SubscriptionTier | null => {
  const path = window.location.pathname;
  
  if (path.includes('/monthly')) {
    return 'monthly';
  } else if (path.includes('/semiannual')) {
    return 'semiannual';
  } else if (path.includes('/annual')) {
    return 'annual';
  }
  
  return null;
};
