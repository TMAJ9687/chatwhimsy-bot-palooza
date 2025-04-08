
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
  
  // Only initialize in development mode or if explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !window.localStorage.getItem('enablePerfMonitoring')) {
    return () => {}; // Return empty cleanup function
  }
  
  isInitialized = true;

  try {
    // Create observer for long tasks with higher threshold to reduce noise
    longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Only log tasks longer than 150ms (increased threshold significantly)
        if (entry.duration > 150) {
          console.warn('Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime)
          });
        }
      });
    });

    // Register observer for long tasks
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Create observer for custom performance measures - with severe limiting
    let measureCount = 0;
    measureObserver = new PerformanceObserver((list) => {
      // Only log every 10th measure to drastically reduce noise
      measureCount++;
      if (measureCount % 10 === 0) {
        const entries = list.getEntries();
        // Only log the last entry to reduce console spam
        if (entries.length > 0) {
          const entry = entries[entries.length - 1];
          // Only log measures over 100ms to reduce noise
          if (entry.duration > 100) {
            console.info(`Performance measure: ${entry.name}`, {
              duration: Math.round(entry.duration)
            });
          }
        }
      }
    });

    // Register observer for measures
    measureObserver.observe({ entryTypes: ['measure'] });

    // Skip frame monitoring completely - it generates too much noise
    // Instead just return the cleanup function

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
