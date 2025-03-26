
/**
 * Utility functions to ensure data is safely serializable for postMessage and Firebase
 */

/**
 * Creates a safely serializable copy of an object by removing non-serializable properties
 * @param data The data to serialize
 * @returns A safely serializable copy of the data
 */
export const makeSerializable = <T>(data: T): T => {
  // If null or undefined, return as is
  if (data == null) return data;
  
  // For primitive types, return as is
  if (typeof data !== 'object' && typeof data !== 'function') {
    return data;
  }
  
  try {
    // First attempt: Use JSON serialization/deserialization as a reliable way to ensure serializability
    // This will strip functions, symbols, circular references, and other non-serializable items
    return JSON.parse(JSON.stringify(data)) as T;
  } catch (error) {
    // If JSON serialization fails (e.g., due to circular references), try manual serialization
    if (Array.isArray(data)) {
      // For arrays, process each element
      return data.map(item => makeSerializable(item)) as unknown as T;
    } else if (data instanceof Date) {
      // For dates, convert to ISO string
      return data.toISOString() as unknown as T;
    } else if (data instanceof Map) {
      // Convert Map to array of entries
      return Array.from(data.entries()) as unknown as T;
    } else if (data instanceof Set) {
      // Convert Set to array
      return Array.from(data) as unknown as T;
    } else if (data instanceof Error) {
      // For errors, convert to plain object
      return {
        name: data.name,
        message: data.message,
        stack: data.stack
      } as unknown as T;
    } else if (data instanceof File) {
      // For File objects, extract basic info
      return {
        name: data.name,
        type: data.type,
        size: data.size,
        lastModified: data.lastModified
      } as unknown as T;
    } else if (data instanceof Blob) {
      // For Blob objects, extract basic info
      return {
        size: data.size,
        type: data.type
      } as unknown as T;
    } else if (data instanceof RegExp) {
      // For RegExp objects, convert to string
      return data.toString() as unknown as T;
    } else if (data instanceof Request || data instanceof Response) {
      // Handle Request and Response objects (common causes of DataCloneError)
      return { 
        type: data instanceof Request ? 'Request' : 'Response',
        url: data instanceof Request ? data.url : '',
        status: data instanceof Response ? data.status : 0,
        statusText: data instanceof Response ? data.statusText : '',
        method: data instanceof Request ? data.method : '',
        headers: Array.from((data.headers?.entries?.() || [])) 
      } as unknown as T;
    } else if (typeof data === 'object') {
      // For objects, create a new object with serializable properties
      const result: Record<string, any> = {};
      
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          try {
            const value = (data as Record<string, any>)[key];
            
            // Skip functions
            if (typeof value === 'function') continue;
            
            // Recursively serialize the value
            result[key] = makeSerializable(value);
          } catch (e) {
            // If serialization fails, use string representation
            console.warn(`Failed to serialize property ${key}`, e);
            try {
              result[key] = String((data as Record<string, any>)[key]);
            } catch {
              result[key] = "[Non-serializable data]";
            }
          }
        }
      }
      
      return result as unknown as T;
    }
    
    // For functions or unhandled types, convert to string
    return String(data) as unknown as T;
  }
};

/**
 * Safe wrapper for API calls to prevent DataCloneError 
 * by ensuring all data is serializable
 */
export const safeApiCall = async <T, Args extends any[]>(
  apiFn: (...args: Args) => Promise<T>,
  ...args: Args
): Promise<T> => {
  try {
    // Make args serializable before passing to API
    const safeArgs = args.map(arg => makeSerializable(arg)) as Args;
    
    // Call the API function with safe args
    const result = await apiFn(...safeArgs);
    
    // Make the result serializable before returning
    return makeSerializable(result);
  } catch (error) {
    console.error('API call failed:', error);
    throw makeSerializable(error);
  }
};

/**
 * Wrap Firestore document data to ensure it's serializable
 * @param data Document data from Firestore
 * @returns Safely serializable data
 */
export const serializeFirestoreData = <T>(data: any): T => {
  if (!data) return null as unknown as T;
  
  // If data has a toJSON method (like Firestore Timestamp), use it
  if (data.toJSON && typeof data.toJSON === 'function') {
    try {
      return makeSerializable(data.toJSON()) as T;
    } catch (e) {
      console.warn("Error using toJSON", e);
    }
  }
  
  // Handle Firestore Timestamp objects specifically
  if (data.seconds !== undefined && data.nanoseconds !== undefined) {
    try {
      // Convert Firestore Timestamp to Date
      const milliseconds = data.seconds * 1000 + data.nanoseconds / 1000000;
      return new Date(milliseconds).toISOString() as unknown as T;
    } catch (e) {
      console.warn("Error converting Timestamp", e);
    }
  }
  
  // Use general serialization for other types
  return makeSerializable(data) as T;
};

/**
 * A queue implementation to prevent concurrent Firebase operations
 * This helps avoid race conditions and reduces serialization issues
 */
export class OperationQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      const operation = this.queue.shift();
      if (operation) await operation();
    } catch (error) {
      console.error("Error in operation queue:", error);
    } finally {
      this.processing = false;
      this.processQueue();
    }
  }
}

// Create a singleton queue instance for Firebase operations
export const firebaseQueue = new OperationQueue();
