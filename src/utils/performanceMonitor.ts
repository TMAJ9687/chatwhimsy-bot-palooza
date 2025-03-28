
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

    // Create observer for frame rates
    if ('PerformanceObserver' in window && 'supportedEntryTypes' in PerformanceObserver) {
      if (PerformanceObserver.supportedEntryTypes.includes('frame')) {
        const frameObserver = new PerformanceObserver((list) => {
          const frames = list.getEntries();
          // Look for dropped frames (large gaps)
          frames.forEach((frame, i) => {
            if (i > 0) {
              const previousFrame = frames[i - 1];
              const gap = frame.startTime - previousFrame.startTime;
              if (gap > 50) { // More than 50ms between frames (< 20fps)
                console.warn('Frame drop detected:', {
                  gap: Math.round(gap),
                  timestamp: frame.startTime
                });
              }
            }
          });
        });
        frameObserver.observe({ entryTypes: ['frame'] });
      }
    }

    console.info('Performance monitoring initialized');
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
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
): ((...args: Parameters<T>) => void) & { flush: () => void } => {
  let timeout: number | null = null;
  
  const debounced = (...args: Parameters<T>): void => {
    if (timeout !== null) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func(...args), wait);
  };
  
  // Add flush method to immediately execute the function
  debounced.flush = () => {
    if (timeout !== null) {
      window.clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
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
