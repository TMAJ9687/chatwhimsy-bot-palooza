
import { VipDuration } from '@/types/admin';
import { debounce } from './performanceMonitor';

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
  switch (duration) {
    case '1 Day':
      return '1 Day';
    case '1 Week':
      return '1 Week';
    case '1 Month':
      return '1 Month';
    case '1 Year':
      return '1 Year';
    case 'Lifetime':
      return 'Lifetime';
    default:
      return duration;
  }
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

/**
 * Debounced admin action executor to prevent UI freezing
 */
export const debouncedAdminAction = debounce((callback: () => Promise<void>) => {
  callback().catch(error => console.error('Admin action error:', error));
}, 50);

/**
 * Format date for display
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};
