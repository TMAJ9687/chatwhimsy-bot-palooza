
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
