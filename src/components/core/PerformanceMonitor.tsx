
import { useEffect, useRef } from 'react';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor';
import { initConsoleFilter, restoreConsole } from '@/utils/consoleFilter';

const PerformanceMonitor = () => {
  // Use ref to track initialization status
  const isInitialized = useRef(false);
  
  useEffect(() => {
    // Only initialize once during the component's lifetime
    if (!isInitialized.current) {
      try {
        // Initialize console filters first
        initConsoleFilter();
        
        // Then performance monitoring
        const cleanup = initPerformanceMonitoring();
        
        // Mark as initialized
        isInitialized.current = true;
        
        // Set up visibility change tracking
        const handleVisibilityChange = () => {
          performance.mark(`visibility_${document.visibilityState}`);
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Track initial load time
        performance.mark('app_load_start');
        window.addEventListener('load', () => {
          performance.mark('app_load_end');
          performance.measure('App Load Time', 'app_load_start', 'app_load_end');
        });
        
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          
          // Only attempt cleanup if we initialized
          if (isInitialized.current) {
            restoreConsole();
            isInitialized.current = false;
          }
          
          // Call any cleanup from performance monitoring
          if (cleanup && typeof cleanup === 'function') {
            cleanup();
          }
        };
      } catch (error) {
        // Safely handle initialization errors
        console.error('Error initializing performance monitor:', error);
      }
    }
    
    return () => {};
  }, []);
  
  return null;
};

export default PerformanceMonitor;
