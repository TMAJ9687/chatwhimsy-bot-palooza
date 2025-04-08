
import { useEffect, useRef } from 'react';
import { initPerformanceMonitoring, clearPerformanceMarks } from '@/utils/performanceMonitor';
import { initConsoleFilter, restoreConsole } from '@/utils/consoleFilter';

const PerformanceMonitor = () => {
  // Use ref to track initialization status
  const isInitialized = useRef(false);
  
  useEffect(() => {
    // Only initialize console filter - performance monitoring completely disabled by default
    if (!isInitialized.current) {
      try {
        // Initialize console filters to drastically reduce logging
        initConsoleFilter();
        
        // Only enable performance monitoring if explicitly requested via localStorage
        if (window.localStorage.getItem('enablePerfMonitoring') === 'true') {
          const cleanup = initPerformanceMonitoring();
          
          // Clean up function for performance monitoring
          return () => {
            if (typeof cleanup === 'function') {
              cleanup();
            }
            clearPerformanceMarks();
          };
        }
        
        // Mark as initialized
        isInitialized.current = true;
        
        // Return cleanup for console filter
        return () => {
          // Only attempt cleanup if we initialized
          if (isInitialized.current) {
            restoreConsole();
            isInitialized.current = false;
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
