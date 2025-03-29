
import { debounce } from '../performanceMonitor';

/**
 * Enhanced debounced admin action executor with queue
 * This prevents UI freezing by batching operations
 */
export const debouncedAdminAction = debounce((callback: () => Promise<void>) => {
  callback().catch(error => console.error('Admin action error:', error));
}, 100);
