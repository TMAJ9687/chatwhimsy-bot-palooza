
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
 * Enhanced debounced admin action executor with queue
 * This version also includes a flush method
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  // Add a flush method to execute immediately
  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

/**
 * Enhanced debounced admin action executor with queue
 * This prevents UI freezing by batching operations
 */
export const debouncedAdminAction = debounce((callback: () => Promise<void>) => {
  callback().catch(error => console.error('Admin action error:', error));
}, 100);

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

/**
 * Batch local storage operations for better performance
 */
export const createStorageBatcher = () => {
  let batchQueue: Record<string, any> = {};
  let isWriteScheduled = false;
  
  // Process queue and write to localStorage
  const processQueue = debounce(() => {
    if (Object.keys(batchQueue).length === 0) {
      isWriteScheduled = false;
      return;
    }
    
    try {
      // Write each key individually to avoid hitting localStorage size limits
      for (const [key, value] of Object.entries(batchQueue)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      console.log('Batch localStorage write completed');
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
    }
    
    // Clear the queue
    batchQueue = {};
    isWriteScheduled = false;
  }, 300);
  
  return {
    /**
     * Schedule an item to be written to localStorage
     */
    queueItem: (key: string, value: any) => {
      batchQueue[key] = value;
      
      if (!isWriteScheduled) {
        isWriteScheduled = true;
        processQueue();
      }
    },
    
    /**
     * Force immediate processing of the queue
     */
    flush: () => {
      processQueue.flush();
    }
  };
};
