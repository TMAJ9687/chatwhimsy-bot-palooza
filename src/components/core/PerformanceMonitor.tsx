
import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor';

const PerformanceMonitor = () => {
  useEffect(() => {
    initPerformanceMonitoring();
    
    const handleVisibilityChange = () => {
      performance.mark(`visibility_${document.visibilityState}`);
      console.info(`App visibility changed to: ${document.visibilityState}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    performance.mark('app_load_start');
    window.addEventListener('load', () => {
      performance.mark('app_load_end');
      performance.measure('App Load Time', 'app_load_start', 'app_load_end');
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return null;
};

export default PerformanceMonitor;
