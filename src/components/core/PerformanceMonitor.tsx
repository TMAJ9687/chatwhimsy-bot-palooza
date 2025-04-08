
import { useEffect, useRef } from 'react';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor';
import { initConsoleFilter, restoreConsole } from '@/utils/consoleFilter';

const PerformanceMonitor = () => {
  // Use ref to track filter initialization status
  const filterInitialized = useRef(false);
  
  useEffect(() => {
    // Initialize console filters to reduce noise - but only do it once
    if (!filterInitialized.current) {
      initConsoleFilter();
      filterInitialized.current = true;
    }
    
    // Initialize performance monitoring
    const cleanup = initPerformanceMonitoring();
    
    const handleVisibilityChange = () => {
      performance.mark(`visibility_${document.visibilityState}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    performance.mark('app_load_start');
    window.addEventListener('load', () => {
      performance.mark('app_load_end');
      performance.measure('App Load Time', 'app_load_start', 'app_load_end');
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Only restore console when component is truly unmounting
      // This prevents console flood during hot reloads
      if (filterInitialized.current) {
        restoreConsole();
        filterInitialized.current = false;
      }
      
      // Call any cleanup from performance monitoring
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);
  
  return null;
};

export default PerformanceMonitor;
