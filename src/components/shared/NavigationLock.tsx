
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

const NavigationLock: React.FC = () => {
  const location = useLocation();
  const { clearOverlays } = useUIState();
  const { cleanupOverlays } = useSafeDOMOperations();
  const lastPathRef = useRef<string>(location.pathname);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
  // Track mounted state to prevent operations after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      
      // Ensure any pending timeouts are cleared on unmount
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Clean up UI state on navigation
  useEffect(() => {
    // Skip if path hasn't changed (prevent unnecessary cleanup)
    if (lastPathRef.current === location.pathname) {
      return;
    }
    
    console.log(`Navigation from ${lastPathRef.current} to ${location.pathname}`);
    lastPathRef.current = location.pathname;
    
    // Use a safe approach to UI cleanup with proper mounted checks
    const performCleanup = () => {
      if (!isMountedRef.current) return;
      
      // Clear any active overlays/modals when route changes
      try {
        clearOverlays();
      } catch (error) {
        console.warn('Error in clearOverlays during navigation:', error);
      }
      
      // Clean up any previous timeout
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      // Use safe DOM operations as a fallback with a delayed execution
      cleanupTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        try {
          cleanupOverlays();
        } catch (error) {
          console.warn('Error in cleanupOverlays during navigation:', error);
        }
        
        cleanupTimeoutRef.current = null;
      }, 200); // Increased timeout for more reliable cleanup
    };
    
    // Use requestAnimationFrame for better synchronization with browser rendering
    requestAnimationFrame(performCleanup);
    
    // Cleanup on unmount or when route changes again
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, [location.pathname, clearOverlays, cleanupOverlays]);
  
  return null;
};

export default NavigationLock;
