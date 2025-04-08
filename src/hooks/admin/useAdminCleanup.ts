
import { useEffect } from 'react';
import { createCleanupFunction, safeCleanup } from '@/utils/cleanup';

/**
 * Hook to ensure proper cleanup of admin operations
 * Prevents memory leaks when switching between admin views
 */
export const useAdminCleanup = (
  isAdmin: boolean,
  cleanupFunctions: Array<(() => void) | undefined>
) => {
  useEffect(() => {
    // Only run if admin
    if (!isAdmin) return;
    
    // Return a cleanup function that safely calls all provided cleanup functions
    return () => {
      const cleanup = createCleanupFunction(...cleanupFunctions);
      safeCleanup(cleanup);
    };
  }, [isAdmin, cleanupFunctions]);
};

export default useAdminCleanup;
