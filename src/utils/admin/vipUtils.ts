
import { VipDuration } from '@/types/admin';

/**
 * Calculate expiry date based on VIP duration
 */
export const calculateExpiryDate = (duration: VipDuration): Date | null => {
  const now = new Date();
  
  switch (duration) {
    case '1 Day':
      now.setDate(now.getDate() + 1);
      return now;
    case '1 Week':
      now.setDate(now.getDate() + 7);
      return now;
    case '1 Month':
      now.setMonth(now.getMonth() + 1);
      return now;
    case '1 Year':
      now.setFullYear(now.getFullYear() + 1);
      return now;
    case 'Lifetime':
      return null; // No expiry for lifetime
    default:
      return now;
  }
};

/**
 * Convert VIP duration to subscription tier
 */
export const durationToTier = (duration: VipDuration) => {
  switch (duration) {
    case '1 Month':
      return 'monthly';
    case '1 Year':
      return 'annual';
    default:
      return 'monthly';
  }
};
