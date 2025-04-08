
/**
 * Performance monitoring utility
 * Used to track UI freezes and long operations
 */

// Observer references for cleanup
let longTaskObserver: PerformanceObserver | null = null;
let measureObserver: PerformanceObserver | null = null;
let frameObserver: PerformanceObserver | null = null;

// Initialize performance observer
export const initPerformanceMonitoring = (): (() => void) => {
  // Only initialize in development mode or if explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !window.localStorage.getItem('enablePerfMonitoring')) {
    return () => {}; // Return empty cleanup function
  }

  try {
    // Create observer for long tasks
    longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log tasks longer than 100ms which might cause UI freezes (increased threshold)
        if (entry.duration > 100) {
          console.warn('Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: entry.startTime,
            name: entry.name
          });
        }
      });
    });

    // Register observer for long tasks
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Create observer for custom performance measures - but limit output
    let measureCount = 0;
    measureObserver = new PerformanceObserver((list) => {
      // Only log every 5th measure to reduce noise
      measureCount++;
      if (measureCount % 5 === 0) {
        const entries = list.getEntries();
        // Only log the last entry to reduce console spam
        if (entries.length > 0) {
          const entry = entries[entries.length - 1];
          console.info(`Performance measure: ${entry.name}`, {
            duration: Math.round(entry.duration)
          });
        }
      }
    });

    // Register observer for measures
    measureObserver.observe({ entryTypes: ['measure'] });

    // Create observer for frame rates - but more sparingly
    if ('PerformanceObserver' in window && 'supportedEntryTypes' in PerformanceObserver) {
      if (PerformanceObserver.supportedEntryTypes.includes('frame')) {
        let frameDropCount = 0;
        frameObserver = new PerformanceObserver((list) => {
          const frames = list.getEntries();
          // Look for dropped frames (large gaps) - but limit reporting
          frames.forEach((frame, i) => {
            if (i > 0) {
              const previousFrame = frames[i - 1];
              const gap = frame.startTime - previousFrame.startTime;
              // More than 100ms between frames (< 10fps) and only log every 5th occurrence
              if (gap > 100) {
                frameDropCount++;
                if (frameDropCount % 5 === 0) {
                  console.warn('Frame drop detected:', {
                    gap: Math.round(gap)
                  });
                }
              }
            }
          });
        });
        frameObserver.observe({ entryTypes: ['frame'] });
      }
    }

    // Return cleanup function
    return () => {
      if (longTaskObserver) {
        longTaskObserver.disconnect();
        longTaskObserver = null;
      }
      if (measureObserver) {
        measureObserver.disconnect();
        measureObserver = null;
      }
      if (frameObserver) {
        frameObserver.disconnect();
        frameObserver = null;
      }
    };
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
    return () => {}; // Return empty cleanup function
  }
};

// Track event timing - now with async support
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

// Track async operations with proper error handling
export const trackAsyncOperation = async <T>(
  operationName: string, 
  asyncCallback: () => Promise<T>
): Promise<T> => {
  performance.mark(`${operationName}_start`);
  try {
    const result = await asyncCallback();
    performance.mark(`${operationName}_end`);
    performance.measure(
      `Async: ${operationName}`,
      `${operationName}_start`,
      `${operationName}_end`
    );
    return result;
  } catch (error) {
    performance.mark(`${operationName}_error`);
    performance.measure(
      `Async Error: ${operationName}`,
      `${operationName}_start`,
      `${operationName}_error`
    );
    throw error;
  }
};

// Debounce function to prevent excessive operations
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout !== null) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// Memoize function for caching expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Safely measure rendering time
export const measureRender = (componentName: string): () => void => {
  const markName = `render_${componentName}_${Date.now()}`;
  performance.mark(markName);
  
  return () => {
    // Call this function in useEffect to measure render completion
    const endMarkName = `${markName}_end`;
    performance.mark(endMarkName);
    performance.measure(
      `Render: ${componentName}`,
      markName,
      endMarkName
    );
  };
};

// Clear all performance marks and measures
export const clearPerformanceMarks = (): void => {
  performance.clearMarks();
  performance.clearMeasures();
};
