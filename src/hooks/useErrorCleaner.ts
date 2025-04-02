
import { useEffect } from 'react';
import { performDOMCleanup } from '@/utils/errorHandler';

/**
 * A hook that ensures DOM is properly cleaned up if errors occur
 */
export const useErrorCleaner = (
  customCleanup?: () => void
) => {
  useEffect(() => {
    // Setup error handler
    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('removeChild') || 
         event.message.includes('appendChild') ||
         event.message.includes('not a child'))
      ) {
        // First perform standard DOM cleanup
        performDOMCleanup();
        
        // Then run custom cleanup if provided
        if (customCleanup) {
          customCleanup();
        }
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [customCleanup]);
};

export default useErrorCleaner;
