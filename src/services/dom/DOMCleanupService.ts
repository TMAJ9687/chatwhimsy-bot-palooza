
/**
 * Service for cleaning up DOM elements, particularly overlays
 */
import { DOMOperationQueue } from './DOMOperationQueue';
import { DOMSafetyUtils } from './DOMSafetyUtils';

export class DOMCleanupService {
  private cleanupInProgress = false;
  private overlaysBeingRemoved = new Set<Element>();
  private isMounted = true; // Track mounted state

  constructor() {
    this.isMounted = true;
  }

  /**
   * Mark service as unmounted (for cleanup)
   */
  public unmount(): void {
    this.isMounted = false;
    this.overlaysBeingRemoved.clear();
  }

  /**
   * Clean up overlay elements using a staged approach
   */
  public cleanupOverlays(
    operationQueue: DOMOperationQueue,
    safetyUtils: DOMSafetyUtils
  ): void {
    // If cleanup is already in progress or service is unmounted, don't start another one
    if (this.cleanupInProgress || !this.isMounted) {
      console.log('[DOMCleanupService] Cleanup already in progress or service unmounted, skipping');
      return;
    }

    const cleanupOperation = () => {
      if (typeof document === 'undefined' || !document.body || !this.isMounted) return;
      
      this.cleanupInProgress = true;
      
      try {
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
        
        // Manually process each selector for safer batch removal
        selectors.forEach(selector => {
          try {
            if (typeof document !== 'undefined') {
              const elements = document.querySelectorAll(selector);
              let removedCount = 0;
              
              elements.forEach(element => {
                if (safetyUtils.safeRemoveElement(element)) {
                  removedCount++;
                }
              });
              
              if (removedCount > 0) {
                console.log(`[DOMCleanupService] Removed ${removedCount} elements with selector ${selector}`);
              }
            }
          } catch (e) {
            console.warn(`[DOMCleanupService] Error removing elements with selector ${selector}:`, e);
          }
        });
        
        // Clear the operation state
        this.cleanupInProgress = false;
      } catch (error) {
        console.warn('[DOMCleanupService] Error during cleanup:', error);
        this.cleanupInProgress = false;
        this.overlaysBeingRemoved.clear();
      }
    };
    
    // Queue the operation
    operationQueue.queueOperation(cleanupOperation);
  }
  
  /**
   * Perform an emergency cleanup of overlay elements
   * This bypasses the queue and does immediate removal
   */
  public emergencyCleanup(safetyUtils: DOMSafetyUtils): void {
    if (!document || !document.body) return;
    
    try {
      console.log('[DOMCleanupService] Performing emergency cleanup');
      
      // Reset body state first
      safetyUtils.resetBodyState();
      
      // Directly remove known overlay selectors
      const selectors = [
        '.fixed.inset-0',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        '.backdrop',
        '.modal-backdrop'
      ];
      
      // Use a more direct approach for emergency cleanup
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          try {
            if (element.parentNode && document.contains(element)) {
              // Safer removal check using Array.from for more reliable checking
              const childNodes = Array.from(element.parentNode.childNodes);
              if (childNodes.includes(element as Node)) {
                try {
                  // First try the safer element.remove() method
                  element.remove();
                } catch (err) {
                  // Fallback to removeChild with validation
                  if (element.parentNode && element.parentNode.contains(element)) {
                    // Double-check it's really a child
                    const updatedChildNodes = Array.from(element.parentNode.childNodes);
                    if (updatedChildNodes.includes(element as Node) && element instanceof Element) {
                      element.parentNode.removeChild(element);
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.warn('[DOMCleanupService] Error during emergency cleanup:', error);
          }
        });
      });
    } catch (error) {
      console.warn('[DOMCleanupService] Failed emergency cleanup:', error);
    }
  }
}
