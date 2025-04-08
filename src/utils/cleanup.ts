
/**
 * Utility for cleanup functions to prevent memory leaks
 */

type CleanupFunction = () => void;

/**
 * Safely executes cleanup functions, catching any errors
 */
export function safeCleanup(cleanupFn?: CleanupFunction): void {
  if (!cleanupFn) return;
  
  try {
    cleanupFn();
  } catch (error) {
    console.warn('Error during cleanup:', error);
  }
}

/**
 * Creates a composite cleanup function from multiple cleanup functions
 */
export function createCleanupFunction(...cleanupFns: Array<CleanupFunction | undefined>): CleanupFunction {
  return () => {
    cleanupFns.forEach(fn => {
      if (fn) safeCleanup(fn);
    });
  };
}

/**
 * Safely removes event listeners
 */
export function removeEventListeners(
  element: Window | Document | HTMLElement | null,
  events: Array<{ type: string; listener: EventListenerOrEventListenerObject }>
): void {
  if (!element) return;
  
  events.forEach(({ type, listener }) => {
    try {
      element.removeEventListener(type, listener);
    } catch (error) {
      console.warn(`Error removing event listener for ${type}:`, error);
    }
  });
}

/**
 * Safely clears timeouts and intervals
 */
export function clearTimers(ids: Array<number | NodeJS.Timeout | null | undefined>): void {
  ids.forEach(id => {
    if (id === null || id === undefined) return;
    
    try {
      clearTimeout(id as number);
    } catch (error) {
      console.warn('Error clearing timeout:', error);
    }
  });
}
