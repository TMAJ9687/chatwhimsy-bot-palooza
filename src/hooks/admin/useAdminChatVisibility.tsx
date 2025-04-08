
import { useState, useEffect } from 'react';

/**
 * Hook to control admin chat visibility based on performance considerations
 */
export const useAdminChatVisibility = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Detect if we're on a performance-sensitive page
    const performanceSensitiveRoutes = [
      '/statistics',
      '/user-reports',
      '/heavy-data'
    ];
    
    const currentPath = window.location.pathname;
    const shouldHideChat = performanceSensitiveRoutes.some(route => 
      currentPath.includes(route)
    );
    
    setIsVisible(!shouldHideChat);
    
    // Listen for route changes that might affect visibility
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      const shouldNowHideChat = performanceSensitiveRoutes.some(route => 
        newPath.includes(route)
      );
      
      setIsVisible(!shouldNowHideChat);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return { isVisible };
};
