
import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor';
import { initConsoleFilter, restoreConsole } from '@/utils/consoleFilter';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Initialize console filters to reduce noise
    initConsoleFilter();
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
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
      restoreConsole();
    };
  }, []);
  
  return null;
};

export default PerformanceMonitor;
