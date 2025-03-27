
/**
 * Service for cleaning up DOM elements, particularly overlays
 */
import { DOMOperationQueue } from './DOMOperationQueue';
import { DOMSafetyUtils } from './DOMSafetyUtils';

export class DOMCleanupService {
  /**
   * Clean up overlay elements using a staged approach
   */
  public cleanupOverlays(
    operationQueue: DOMOperationQueue,
    safetyUtils: DOMSafetyUtils
  ): void {
    const cleanupOperation = () => {
      if (typeof document === 'undefined' || !document.body) return;
      
      // Reset body scroll
      safetyUtils.resetBodyState();
      
      // Combined selectors for potential overlay elements
      const selectors = [
        '.fixed.inset-0.z-50',
        '.fixed.inset-0.bg-black\\/80',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        '.vaul-overlay',
        '.backdrop',
        '.modal-backdrop'
      ];
      
      // Collect all overlays
      const overlaysToRemove: Element[] = [];
      
      // First find all elements to remove
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(overlay => {
            if (overlay.parentNode) {
              overlaysToRemove.push(overlay);
            }
          });
        } catch (e) {
          console.warn(`[DOMCleanupService] Error finding selector ${selector}:`, e);
        }
      });
      
      // Then remove them sequentially with delays
      if (overlaysToRemove.length > 0) {
        let index = 0;
        
        const removeNext = () => {
          if (index < overlaysToRemove.length) {
            const overlay = overlaysToRemove[index];
            safetyUtils.safeRemoveElement(overlay, new WeakMap());
            index++;
            
            const timeoutId = window.setTimeout(removeNext, 16); // ~60fps
            // We can't store these timeouts since they're created inside the operation
            // They will be cleaned up when the page unloads
          }
        };
        
        removeNext();
      }
    };
    
    operationQueue.queueOperation(cleanupOperation);
  }
}
