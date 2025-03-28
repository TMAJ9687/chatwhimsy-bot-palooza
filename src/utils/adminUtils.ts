
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

/**
 * Generate mock traffic statistics data
 */
export const getTrafficStatistics = () => {
  // Last 7 days data
  const dailyTraffic = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      visitors: Math.floor(Math.random() * 500) + 200,
      pageViews: Math.floor(Math.random() * 1500) + 500,
      uniqueVisitors: Math.floor(Math.random() * 400) + 150,
    };
  });

  // Traffic sources
  const trafficSources = [
    { name: 'Direct', value: Math.floor(Math.random() * 40) + 20 },
    { name: 'Search', value: Math.floor(Math.random() * 30) + 15 },
    { name: 'Social', value: Math.floor(Math.random() * 20) + 10 },
    { name: 'Referral', value: Math.floor(Math.random() * 15) + 5 },
    { name: 'Other', value: Math.floor(Math.random() * 10) + 5 },
  ];

  // Visitors by country
  const visitorsByCountry = [
    { name: 'United States', value: Math.floor(Math.random() * 40) + 20 },
    { name: 'United Kingdom', value: Math.floor(Math.random() * 20) + 10 },
    { name: 'Germany', value: Math.floor(Math.random() * 15) + 5 },
    { name: 'France', value: Math.floor(Math.random() * 10) + 5 },
    { name: 'Canada', value: Math.floor(Math.random() * 10) + 5 },
    { name: 'Other', value: Math.floor(Math.random() * 20) + 10 },
  ];

  return {
    dailyTraffic,
    trafficSources,
    visitorsByCountry,
    totalVisitors: dailyTraffic.reduce((acc, day) => acc + day.visitors, 0),
    totalPageViews: dailyTraffic.reduce((acc, day) => acc + day.pageViews, 0),
    averageSessionDuration: Math.floor(Math.random() * 180) + 60, // in seconds
  };
};

/**
 * Generate mock user statistics data
 */
export const getUserStatistics = () => {
  // User registrations over time (last 7 days)
  const userRegistrations = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      standard: Math.floor(Math.random() * 30) + 10,
      vip: Math.floor(Math.random() * 15) + 5,
    };
  });

  // User demographics
  const userDemographics = {
    age: [
      { name: '18-24', value: Math.floor(Math.random() * 20) + 10 },
      { name: '25-34', value: Math.floor(Math.random() * 30) + 20 },
      { name: '35-44', value: Math.floor(Math.random() * 20) + 15 },
      { name: '45-54', value: Math.floor(Math.random() * 15) + 10 },
      { name: '55+', value: Math.floor(Math.random() * 10) + 5 },
    ],
    gender: [
      { name: 'Male', value: Math.floor(Math.random() * 60) + 40 },
      { name: 'Female', value: Math.floor(Math.random() * 40) + 20 },
      { name: 'Other', value: Math.floor(Math.random() * 5) + 1 },
    ]
  };

  // Online users by hour (last 24 hours)
  const onlineUsers = Array(24).fill(0).map((_, i) => {
    return {
      hour: i.toString().padStart(2, '0') + ':00',
      users: Math.floor(Math.random() * 100) + 50,
    };
  });

  return {
    userRegistrations,
    userDemographics,
    onlineUsers,
    totalStandardUsers: Math.floor(Math.random() * 1000) + 500,
    totalVipUsers: Math.floor(Math.random() * 300) + 100,
    activeUsersToday: Math.floor(Math.random() * 200) + 100,
    conversionRate: (Math.random() * 10 + 5).toFixed(2) + '%', // Standard to VIP conversion
  };
};

/**
 * Generate mock content statistics data
 */
export const getContentStatistics = () => {
  // Messages per day (last 7 days)
  const messagesPerDay = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      standard: Math.floor(Math.random() * 1000) + 500,
      vip: Math.floor(Math.random() * 2000) + 1000,
      bot: Math.floor(Math.random() * 3000) + 1500,
    };
  });

  // Media uploads per day (last 7 days)
  const uploadsPerDay = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      images: Math.floor(Math.random() * 50) + 20,
      videos: Math.floor(Math.random() * 20) + 5,
    };
  });

  // Bot interactions
  const botInteractions = Array(10).fill(0).map((_, i) => {
    return {
      botName: `Bot ${i + 1}`,
      interactions: Math.floor(Math.random() * 500) + 100,
    };
  }).sort((a, b) => b.interactions - a.interactions);

  return {
    messagesPerDay,
    uploadsPerDay,
    botInteractions,
    totalMessages: messagesPerDay.reduce((acc, day) => 
      acc + day.standard + day.vip + day.bot, 0),
    totalUploads: uploadsPerDay.reduce((acc, day) => 
      acc + day.images + day.videos, 0),
    averageMessagesPerUser: Math.floor(Math.random() * 20) + 10,
  };
};

/**
 * Generate mock system performance statistics
 */
export const getSystemStatistics = () => {
  // Server response time over time (last 24 hours)
  const serverResponse = Array(24).fill(0).map((_, i) => {
    return {
      hour: i.toString().padStart(2, '0') + ':00',
      responseTime: Math.floor(Math.random() * 200) + 50, // in ms
    };
  });

  // Error rates over time (last 7 days)
  const errorRates = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      errors: Math.floor(Math.random() * 50), // number of errors
      requests: Math.floor(Math.random() * 5000) + 1000, // total requests
    };
  });

  // Resource usage
  const resourceUsage = [
    { name: 'CPU', value: Math.floor(Math.random() * 60) + 20 },
    { name: 'Memory', value: Math.floor(Math.random() * 70) + 30 },
    { name: 'Disk', value: Math.floor(Math.random() * 50) + 30 },
    { name: 'Network', value: Math.floor(Math.random() * 40) + 20 },
  ];

  return {
    serverResponse,
    errorRates,
    resourceUsage,
    uptime: Math.floor(Math.random() * 30) + 5, // in days
    totalRequests: errorRates.reduce((acc, day) => acc + day.requests, 0),
    averageResponseTime: serverResponse.reduce((acc, hour) => 
      acc + hour.responseTime, 0) / serverResponse.length,
  };
};
