
import { debounce, memoize } from './performanceMonitor';

/**
 * Chart data types for the admin dashboard
 */
export type ChartDataPoint = {
  name: string;
  value: number;
  fill?: string;
};

export type LineChartDataPoint = {
  name: string;
  [key: string]: number | string;
};

/**
 * Throttle chart updates to prevent excessive rerenders
 */
export const throttleChartUpdate = debounce((callback: () => void) => {
  callback();
}, 300);

/**
 * Memoize chart data calculations to improve performance
 */
export const memoizeChartData = memoize(<T>(dataFn: () => T): T => {
  return dataFn();
});

/**
 * Format large numbers for display in charts
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Generate random data for the charts (for demo purposes)
 */
export const generateRandomData = (count: number, min: number, max: number): number[] => {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

/**
 * Generate random chart data points
 */
export const generateRandomChartData = (
  labels: string[], 
  min: number, 
  max: number
): ChartDataPoint[] => {
  return labels.map(label => ({
    name: label,
    value: Math.floor(Math.random() * (max - min + 1)) + min
  }));
};

/**
 * Generate random line chart data
 */
export const generateRandomLineData = (
  timePoints: string[],
  metrics: string[],
  min: number,
  max: number
): LineChartDataPoint[] => {
  return timePoints.map(time => {
    const dataPoint: LineChartDataPoint = { name: time };
    
    metrics.forEach(metric => {
      dataPoint[metric] = Math.floor(Math.random() * (max - min + 1)) + min;
    });
    
    return dataPoint;
  });
};
