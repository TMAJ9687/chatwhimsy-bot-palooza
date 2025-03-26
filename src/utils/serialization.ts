
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
  
  try {
    // Test if the data is already serializable
    JSON.stringify(data);
    return data;
  } catch (error) {
    // If data is an object, try to make a serializable copy
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        // For arrays, process each element
        return data.map(item => makeSerializable(item)) as unknown as T;
      } else {
        // For objects, create a new object with serializable properties
        const result: Record<string, any> = {};
        
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            try {
              const value = (data as Record<string, any>)[key];
              
              // Skip functions and other non-serializable types
              if (typeof value === 'function') continue;
              if (value instanceof Error) {
                result[key] = { 
                  message: value.message, 
                  name: value.name 
                };
                continue;
              }
              if (value instanceof Date) {
                result[key] = value.toISOString();
                continue;
              }
              
              // Try to serialize the value
              result[key] = makeSerializable(value);
            } catch (e) {
              // If serialization fails, convert to a string representation
              console.warn(`Failed to serialize property ${key}`, e);
              try {
                result[key] = String(data[key as keyof T]);
              } catch {
                result[key] = "[Non-serializable data]";
              }
            }
          }
        }
        
        return result as unknown as T;
      }
    }
    
    // For primitives or unhandled types, convert to string
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
