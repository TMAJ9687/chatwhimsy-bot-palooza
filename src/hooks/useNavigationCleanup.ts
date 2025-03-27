
import { useCallback, useEffect, useRef } from 'react';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to handle cleanup operations during navigation
 */
export const useNavigationCleanup = () => {
  const cleanupAttemptRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const cleanupTimeoutsRef = useRef<number[]>([]);
  const navigationInProgressRef = useRef(false);
  
  // Use our enhanced safe DOM operations hook
  const { cleanupOverlays, isDOMReady } = useSafeDOMOperations();

  // Enhanced DOM cleanup utility with debouncing and safeguards
  const cleanupUI = useCallback(() => {
    if (!isDOMReady()) return;
    
    const now = Date.now();
    // Debounce cleanup attempts that happen too quickly
    if (cleanupAttemptRef.current || (now - lastCleanupTimeRef.current < 200)) return;
    
    cleanupAttemptRef.current = true;
    lastCleanupTimeRef.current = now;
    
    try {
      // Clear any stale timeouts
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Reset body scroll
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Use our safe overlay cleanup after a short delay
      const timeoutId = window.setTimeout(() => {
        cleanupOverlays();
      }, 50);
      
      cleanupTimeoutsRef.current.push(timeoutId);
      
      // Clear any navigation locks
      localStorage.removeItem('vipNavigationInProgress');
      navigationInProgressRef.current = false;
    } catch (error) {
      console.warn('Error during UI cleanup:', error);
    } finally {
      // Reset the cleanup attempt flag after a short delay
      const timeoutId = window.setTimeout(() => {
        cleanupAttemptRef.current = false;
      }, 300);
      cleanupTimeoutsRef.current.push(timeoutId);
    }
  }, [cleanupOverlays, isDOMReady]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts on component unmount
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
    };
  }, []);

  return {
    cleanupUI,
    cleanupTimeoutsRef,
    navigationInProgressRef
  };
};
