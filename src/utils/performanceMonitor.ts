
/**
 * Performance monitoring utility
 * Used to track UI freezes and long operations
 */

// Initialize performance observer
export const initPerformanceMonitoring = (): void => {
  // Only initialize in development mode or if explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !window.localStorage.getItem('enablePerfMonitoring')) {
    return;
  }

  try {
    // Create observer for long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log tasks longer than 50ms which might cause UI freezes
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: entry.startTime,
            name: entry.name,
            entryType: entry.entryType
          });
        }
      });
    });

    // Register observer for long tasks
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Create observer for custom performance measures
    const measureObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log custom performance measures
        console.info(`Performance measure: ${entry.name}`, {
          duration: Math.round(entry.duration),
          startTime: entry.startTime
        });
      });
    });

    // Register observer for measures
    measureObserver.observe({ entryTypes: ['measure'] });

    console.info('Performance monitoring initialized');
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
  }
};

// Track event timing
export const trackEvent = (eventName: string, callback: () => void): void => {
  performance.mark(`${eventName}_start`);
  callback();
  performance.mark(`${eventName}_end`);
  performance.measure(
    `Event: ${eventName}`,
    `${eventName}_start`,
    `${eventName}_end`
  );
};

// Clear all performance marks and measures
export const clearPerformanceMarks = (): void => {
  performance.clearMarks();
  performance.clearMeasures();
};
