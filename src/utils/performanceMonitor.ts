
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
    // Create observer for long tasks with higher threshold to reduce noise
    longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Only log tasks longer than 500ms (increased threshold drastically)
        if (entry.duration > 500) {
          console.warn('Critical long task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime)
          });
        }
      });
    });

    // Register observer for long tasks
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Skip measure observer entirely - it generates too much noise

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

// Track event timing - NOOP implementation to avoid errors
export const trackEvent = (eventName: string, callback: () => void): void => {
  callback(); // Just call the callback without any performance tracking
};

// Track async operations - NOOP implementation to avoid errors
export const trackAsyncOperation = async <T>(
  operationName: string, 
  asyncCallback: () => Promise<T>
): Promise<T> => {
  return asyncCallback(); // Just call the callback without any performance tracking
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

// Safely measure rendering time - NOOP implementation
export const measureRender = (componentName: string): () => void => {
  return () => {}; // Do nothing to avoid unnecessary tracking
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
