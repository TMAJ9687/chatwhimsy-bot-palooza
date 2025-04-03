
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
    
    // Clear any active overlays/modals when route changes
    if (isMountedRef.current) {
      clearOverlays();
    }
    
    // Clean up any previous timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    // Use safe DOM operations as a fallback with a delayed execution
    if (isMountedRef.current) {
      cleanupTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          cleanupOverlays();
        }
        cleanupTimeoutRef.current = null;
      }, 150); // Increased timeout to ensure components have time to unmount properly
    }
    
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
