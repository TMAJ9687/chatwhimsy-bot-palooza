
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
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const currentPathRef = useRef<string>(window.location.pathname);
  
  // Memoize the check for performance-sensitive routes
  const shouldHideChat = useMemo(() => {
    const currentPath = currentPathRef.current;
    return PERFORMANCE_SENSITIVE_ROUTES.some(route => currentPath.includes(route));
  }, [currentPathRef.current]);
  
  useEffect(() => {
    // Only update state if it would actually change
    setIsVisible(!shouldHideChat);
    
    // Listen for route changes that might affect visibility
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      
      // Only process if path actually changed
      if (newPath !== currentPathRef.current) {
        currentPathRef.current = newPath;
        
        const shouldNowHideChat = PERFORMANCE_SENSITIVE_ROUTES.some(route => 
          newPath.includes(route)
        );
        
        // Only update state if it would change
        if (shouldNowHideChat === isVisible) {
          setIsVisible(!shouldNowHideChat);
        }
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [shouldHideChat, isVisible]);

  return { isVisible };
};
