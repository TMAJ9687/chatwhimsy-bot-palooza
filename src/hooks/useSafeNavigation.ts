
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';

/**
 * Hook to handle safe navigation with state cleanup
 */
export const useSafeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startNavigation, endNavigation, clearOverlays } = useUIState();
  const navigationTimeoutRef = useRef<number | null>(null);

  // Clean up any navigation timeouts on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Track route changes to clean up UI
  useEffect(() => {
    // Perform cleanup when location changes
    clearOverlays();
    endNavigation();
    
    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    
  }, [location.pathname, clearOverlays, endNavigation]);

  // Safe navigation function
  const safeNavigate = useCallback((to: string) => {
    // Start navigation process
    startNavigation(to);
    
    // Clean up UI state
    clearOverlays();
    
    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      // Navigate after a short delay to allow cleanup
      navigationTimeoutRef.current = window.setTimeout(() => {
        navigate(to);
        
        // End navigation after another short delay
        navigationTimeoutRef.current = window.setTimeout(() => {
          endNavigation();
          navigationTimeoutRef.current = null;
        }, 100);
      }, 50);
    });
  }, [navigate, startNavigation, endNavigation, clearOverlays]);

  return { safeNavigate };
};
