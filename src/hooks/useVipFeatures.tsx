
import { useUser } from '@/context/UserContext';

export type VipFeature = 
  | 'unlimitedImages'
  | 'voiceMessages'
  | 'chatHistory'
  | 'readReceipts'
  | 'typingIndicators'
  | 'messageStatus'
  | 'prioritySupport'
  | 'interestMatching'
  | 'customAvatars';

export const useVipFeatures = () => {
  const { isVip, user } = useUser();
  
  const hasFeature = (feature: VipFeature): boolean => {
    if (!isVip) return false;
    
    // Additional checks for specific features could be added here
    // For example, checking if the subscription tier includes a particular feature
    
    return true;
  };
  
  const getImagesRemaining = (): number => {
    if (isVip) return Infinity;
    return user?.imagesRemaining || 0;
  };
  
  const getVoiceMessagesRemaining = (): number => {
    if (isVip) return Infinity;
    return user?.voiceMessagesRemaining || 0;
  };
  
  return {
    isVip,
    hasFeature,
    getImagesRemaining,
    getVoiceMessagesRemaining
  };
};
