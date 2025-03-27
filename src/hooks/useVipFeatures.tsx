
import { useUser } from '@/context/UserContext';

export type VipFeature = 
  | 'unlimitedUploads'
  | 'unlimitedMessages'
  | 'longerMessages'
  | 'messageStatus'
  | 'prioritySupport'
  | 'customAvatars';

export const useVipFeatures = () => {
  const { isVip, user } = useUser();
  
  const hasFeature = (feature: VipFeature): boolean => {
    if (!isVip) return false;
    
    // All VIP users have all features for now
    // In the future, we could implement different tiers with different features
    return true;
  };
  
  const getImagesRemaining = (): number => {
    if (isVip) return Infinity;
    return user?.imagesRemaining || 15; // Default value
  };
  
  return {
    isVip,
    hasFeature,
    getImagesRemaining
  };
};
