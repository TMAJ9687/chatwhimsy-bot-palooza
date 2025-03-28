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
  const processQueueFn = () => {
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
  };
  
  // Create a debounced version of the processQueue function
  const processQueue = debounce(processQueueFn, 300);
  
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
      // Call the original function directly to bypass debounce
      processQueueFn();
    }
  };
};

/**
 * Types for Admin Stats
 */
export type StatisticTimeRange = 'day' | 'week' | 'month' | 'year';

export type StatisticMetric = {
  name: string;
  value: number;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
};

/**
 * Get sample statistics data (for demonstration purposes)
 */
export const getSampleStatistics = (timeRange: StatisticTimeRange = 'month'): Record<string, StatisticMetric> => {
  // This would normally fetch from an API or database
  const stats: Record<string, StatisticMetric> = {
    totalUsers: {
      name: 'Total Users',
      value: 8700,
      change: 12,
      changeDirection: 'up'
    },
    activeUsers: {
      name: 'Active Users',
      value: 6240, 
      change: 8,
      changeDirection: 'up'
    },
    messagesSent: {
      name: 'Messages Sent',
      value: timeRange === 'day' ? 24500 : 
             timeRange === 'week' ? 175000 : 
             timeRange === 'month' ? 750000 :
             9000000,
      change: 15,
      changeDirection: 'up'
    },
    mediaUploaded: {
      name: 'Media Uploaded',
      value: timeRange === 'day' ? 3600 : 
             timeRange === 'week' ? 25000 : 
             timeRange === 'month' ? 110000 :
             1320000,
      change: 7,
      changeDirection: 'up'
    },
    premiumUsers: {
      name: 'Premium Users',
      value: 1500,
      change: 5,
      changeDirection: 'up'
    },
    serverUptime: {
      name: 'Server Uptime',
      value: 99.98,
      change: 0.01,
      changeDirection: 'up'
    },
    errorRate: {
      name: 'Error Rate',
      value: 0.05,
      change: 0.02,
      changeDirection: 'down'
    }
  };

  return stats;
};
