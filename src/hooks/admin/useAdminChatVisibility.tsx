
import { useState, useEffect, useRef, useMemo } from 'react';

// List of routes where the admin chat should be hidden
const PERFORMANCE_SENSITIVE_ROUTES = [
  '/statistics',
  '/user-reports',
  '/heavy-data'
];

/**
 * Hook to control admin chat visibility based on performance considerations
 * Optimized to reduce re-renders and state changes
 */
export const useAdminChatVisibility = () => {
  // Start with true and calculate once on mount
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const currentPathRef = useRef<string>(window.location.pathname);
  const initialized = useRef(false);
  
  // Memoize the check for performance-sensitive routes
  const shouldHideChat = useMemo(() => {
    const currentPath = currentPathRef.current;
    return PERFORMANCE_SENSITIVE_ROUTES.some(route => currentPath.includes(route));
  }, [currentPathRef.current]);
  
  useEffect(() => {
    // Only run this effect once on mount
    if (!initialized.current) {
      initialized.current = true;
      
      // Set initial visibility state based on route
      setIsVisible(!shouldHideChat);
      
      // Only listen for route changes, skip frequent re-checks
      const handleRouteChange = () => {
        const newPath = window.location.pathname;
        
        // Only process if path actually changed
        if (newPath !== currentPathRef.current) {
          currentPathRef.current = newPath;
          
          const shouldNowHideChat = PERFORMANCE_SENSITIVE_ROUTES.some(route => 
            newPath.includes(route)
          );
          
          // Only update state if it would actually change
          if ((shouldNowHideChat && isVisible) || (!shouldNowHideChat && !isVisible)) {
            setIsVisible(!shouldNowHideChat);
          }
        }
      };
      
      // Listen for navigation events
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []); // Empty dependency array to run only once

  return { isVisible };
};
