
// This file will be imported by the regular code,
// but will be instantiated as a worker

export {}; // Ensure this is treated as a module

// Message handler types
interface StorageMessage {
  type: 'SAVE' | 'LOAD' | 'DELETE';
  key?: string;
  data?: any;
  batch?: Record<string, any>;
}

interface StorageResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestType?: string;
}

// Get the context - either self (worker) or window (main thread fallback)
const ctx: Worker | Window = typeof self !== 'undefined' ? self : window;

// Check if we're in a worker context by checking for typical worker-only properties
const isWorkerContext = typeof self !== 'undefined' && 
                        typeof window === 'undefined' && 
                        self.constructor.name === 'DedicatedWorkerGlobalScope';

// Handle messages in worker context
if (isWorkerContext) {
  self.onmessage = (e: MessageEvent<StorageMessage>) => {
    const { type, key, data, batch } = e.data;
    
    try {
      switch (type) {
        case 'SAVE':
          if (key && data !== undefined) {
            localStorage.setItem(key, JSON.stringify(data));
          } else if (batch) {
            // Process batch operations
            for (const [batchKey, batchData] of Object.entries(batch)) {
              localStorage.setItem(batchKey, JSON.stringify(batchData));
            }
          }
          self.postMessage({ success: true, requestType: type });
          break;
          
        case 'LOAD':
          if (key) {
            const storedData = localStorage.getItem(key);
            self.postMessage({ 
              success: true, 
              data: storedData ? JSON.parse(storedData) : null,
              requestType: type
            });
          }
          break;
          
        case 'DELETE':
          if (key) {
            localStorage.removeItem(key);
            self.postMessage({ success: true, requestType: type });
          }
          break;
          
        default:
          throw new Error(`Unknown operation type: ${type}`);
      }
    } catch (error) {
      console.error('Worker error:', error);
      self.postMessage({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        requestType: type
      });
    }
  };
}
