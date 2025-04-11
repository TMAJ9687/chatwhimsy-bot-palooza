
import { SubscriptionTier } from '@/types/user';

/**
 * Redirect users to the VIP subscription page based on the tier they selected
 * 
 * @param tier The subscription tier selected
 * @param navigate React Router's navigate function (optional)
 * @param testing Optional flag to enable testing mode
 * @returns True if redirect was successful, false otherwise
 */
export const redirectToVipSubscription = (
  tier: SubscriptionTier, 
  navigate?: (path: string) => void,
  testing?: boolean
): boolean => {
  try {
    // Get the appropriate URL based on the subscription tier
    let redirectUrl = '';
    
    switch(tier) {
      case 'monthly':
        redirectUrl = '/vip-payment';
        break;
      case 'semiannual':
        redirectUrl = '/vip-payment';
        break;
      case 'annual':
        redirectUrl = '/vip-payment';
        break;
      default:
        redirectUrl = '/vip-subscription';
    }
    
    // In testing mode, just log the URL
    if (testing) {
      console.log('Redirecting to VIP subscription page:', redirectUrl);
      return true;
    }
    
    if (navigate) {
      // Use React Router navigation if provided
      console.log('Using React Router to navigate to:', redirectUrl);
      
      // Pass tier information as state
      navigate(redirectUrl, { 
        state: { tier } 
      });
      return true;
    } else {
      // Fallback to window.location only if navigate isn't provided
      console.log('Fallback: using window.location to navigate to:', redirectUrl);
      
      // Add tier as a query parameter for window.location navigation
      const urlWithParams = new URL(redirectUrl, window.location.origin);
      urlWithParams.searchParams.append('tier', tier);
      
      // Add a small delay for better UX
      setTimeout(() => {
        window.location.href = urlWithParams.toString();
      }, 300);
      return true;
    }
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
  return path.startsWith('/subscribe') || path.startsWith('/vip-subscription') || path.startsWith('/vip-payment');
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
  
  // Check query parameters as a fallback
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier');
  
  if (tierParam === 'monthly' || tierParam === 'semiannual' || tierParam === 'annual') {
    return tierParam;
  }
  
  return null;
};
