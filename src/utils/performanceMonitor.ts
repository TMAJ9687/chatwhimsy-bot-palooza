
/**
 * Performance monitoring utility
 * Used to track UI freezes and long operations with minimal logging
 */

// Observer references for cleanup
let longTaskObserver: PerformanceObserver | null = null;
let measureObserver: PerformanceObserver | null = null;
let frameObserver: PerformanceObserver | null = null;

// Prevent multiple initializations
let isInitialized = false;

// Initialize performance observer
export const initPerformanceMonitoring = (): (() => void) => {
  // Only initialize once
  if (isInitialized) {
    return () => {}; // Return empty cleanup if already initialized
  }
  
  // Only initialize if explicitly enabled
  if (!window.localStorage.getItem('enablePerfMonitoring')) {
    return () => {}; // Return empty cleanup function
  }
  
  isInitialized = true;

  try {
    // Create observer for long tasks with lower threshold to improve detection
    longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Lower threshold to 100ms to catch more potential UI freezes
        if (entry.duration > 100) {
          console.warn('Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime)
          });
        }
      });
    });

    // Register observer for long tasks
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Frame observer to detect dropped frames
    try {
      frameObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // More than 3 frames at 60fps
            console.warn('Frame drop detected:', Math.round(entry.duration));
          }
        });
      });
      frameObserver.observe({ entryTypes: ['frame'] });
    } catch (e) {
      // Frame timing may not be supported in all browsers
      console.log('Frame timing not supported');
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
      
      isInitialized = false;
    };
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
    isInitialized = false;
    return () => {}; // Return empty cleanup function
  }
};

// Track event timing with improved implementation
export const trackEvent = (eventName: string, callback: () => void): void => {
  if (!isInitialized) {
    callback(); // Just call the callback without any performance tracking
    return;
  }

  try {
    performance.mark(`${eventName}-start`);
    callback();
    performance.mark(`${eventName}-end`);
    performance.measure(eventName, `${eventName}-start`, `${eventName}-end`);
    
    // Clean up marks
    performance.clearMarks(`${eventName}-start`);
    performance.clearMarks(`${eventName}-end`);
  } catch (e) {
    // Fallback if performance API fails
    callback();
  }
};

// Track async operations with improved implementation
export const trackAsyncOperation = async <T>(
  operationName: string, 
  asyncCallback: () => Promise<T>
): Promise<T> => {
  if (!isInitialized) {
    return asyncCallback(); // Just call the callback without any performance tracking
  }

  try {
    performance.mark(`${operationName}-start`);
    const result = await asyncCallback();
    performance.mark(`${operationName}-end`);
    performance.measure(operationName, `${operationName}-start`, `${operationName}-end`);
    
    // Clean up marks
    performance.clearMarks(`${operationName}-start`);
    performance.clearMarks(`${operationName}-end`);
    
    return result;
  } catch (e) {
    // Re-throw for proper error handling
    throw e;
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

// Safely measure rendering time with improved implementation
export const measureRender = (componentName: string): () => void => {
  if (!isInitialized) {
    return () => {}; // Do nothing to avoid unnecessary tracking
  }
  
  const markName = `${componentName}-render-start`;
  try {
    performance.mark(markName);
  } catch (e) {
    // Ignore errors in performance API
    return () => {};
  }
  
  return () => {
    try {
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render-time`,
        markName,
        `${componentName}-render-end`
      );
      performance.clearMarks(markName);
      performance.clearMarks(`${componentName}-render-end`);
    } catch (e) {
      // Ignore errors in performance API
    }
  };
};

// Clear all performance marks and measures
export const clearPerformanceMarks = (): void => {
  try {
    performance.clearMarks();
    performance.clearMeasures();
  } catch (e) {
    // Ignore errors
  }
};
