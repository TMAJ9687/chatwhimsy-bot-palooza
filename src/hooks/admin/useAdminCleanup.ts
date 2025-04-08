
import { useEffect, useRef } from 'react';
import { createCleanupFunction, safeCleanup } from '@/utils/cleanup';

/**
 * Hook to ensure proper cleanup of admin operations
 * Prevents memory leaks when switching between admin views
 */
export const useAdminCleanup = (
  isAdmin: boolean,
  cleanupFunctions: Array<(() => void) | undefined>
) => {
  // Use a ref to store the cleanup state
  const cleanupRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Only run if admin
    if (!isAdmin) return;
    
    // Create single cleanup function once and store it
    const cleanup = createCleanupFunction(...cleanupFunctions);
    
    // Return a cleanup function that safely calls all provided cleanup functions
    return () => {
      // Prevent duplicate cleanups
      if (cleanupRef.current) return;
      cleanupRef.current = true;
      
      // Log only once when cleaning up
      console.log('Admin cleanup running - preventing memory leaks');
      safeCleanup(cleanup);
    };
  }, [isAdmin]); // Only depend on isAdmin to prevent recreation
};

export default useAdminCleanup;
