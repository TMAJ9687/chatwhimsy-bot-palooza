
import { debounce } from '../performanceMonitor';

/**
 * Batch local storage operations for better performance
 */
export const createStorageBatcher = () => {
  let batchQueue: Record<string, any> = {};
  let isWriteScheduled = false;
  
  // Process queue and write to localStorage
  const processQueueFn = () => {
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
  };
  
  // Create a debounced version of the processQueue function
  const processQueue = debounce(processQueueFn, 300);
  
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
      // Call the original function directly to bypass debounce
      processQueueFn();
    }
  };
};
