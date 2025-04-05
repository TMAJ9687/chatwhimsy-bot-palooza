
import { VipDuration } from '@/types/admin';

/**
 * Available VIP duration options
 */
export const VIP_DURATION_OPTIONS: VipDuration[] = [
  '1 Day',
  '1 Week',
  '1 Month',
  '1 Year',
  'Lifetime'
];

/**
 * Get display text for a VIP duration
 */
export const getVipDurationDisplay = (duration: VipDuration): string => {
  return duration;
};

/**
 * Calculate expiry date based on VIP duration
 */
export const calculateExpiryDate = (duration: VipDuration): Date | null => {
  const now = new Date();
  
  if (duration === '1 Day') {
    return new Date(now.setDate(now.getDate() + 1));
  } else if (duration === '1 Week') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (duration === '1 Month') {
    return new Date(now.setMonth(now.getMonth() + 1));
  } else if (duration === '1 Year') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else if (duration === 'Lifetime') {
    return null; // No expiry
  }
  
  return new Date(now.setDate(now.getDate() + 1)); // Default to 1 day if unknown
};
