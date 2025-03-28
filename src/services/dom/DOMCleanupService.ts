
/**
 * Service for cleaning up DOM elements, particularly overlays
 */
import { DOMOperationQueue } from './DOMOperationQueue';
import { DOMSafetyUtils } from './DOMSafetyUtils';

export class DOMCleanupService {
  private cleanupInProgress = false;
  private overlaysBeingRemoved = new Set<Element>();

  /**
   * Clean up overlay elements using a staged approach
   */
  public cleanupOverlays(
    operationQueue: DOMOperationQueue,
    safetyUtils: DOMSafetyUtils
  ): void {
    // If cleanup is already in progress, don't start another one
    if (this.cleanupInProgress) {
      console.log('[DOMCleanupService] Cleanup already in progress, skipping');
      return;
    }

    const cleanupOperation = () => {
      if (typeof document === 'undefined' || !document.body) return;
      
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
        
        // Collect all overlays
        const overlaysToRemove: Element[] = [];
        
        // First find all elements to remove, avoiding duplicates
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(overlay => {
              // Skip elements that are already being processed
              if (!this.overlaysBeingRemoved.has(overlay) && 
                  overlay.parentNode && 
                  document.contains(overlay)) {
                overlaysToRemove.push(overlay);
                this.overlaysBeingRemoved.add(overlay);
              }
            });
          } catch (e) {
            console.warn(`[DOMCleanupService] Error finding selector ${selector}:`, e);
          }
        });
        
        // If there are no overlays to remove, exit early
        if (overlaysToRemove.length === 0) {
          this.cleanupInProgress = false;
          return;
        }
        
        // Then remove them sequentially with delays
        let index = 0;
        
        const removeNext = () => {
          if (index < overlaysToRemove.length) {
            const overlay = overlaysToRemove[index];
            
            // Double check the element is still valid before attempting removal
            if (overlay && 
                overlay.parentNode && 
                document.contains(overlay)) {
              const removed = safetyUtils.safeRemoveElement(overlay, new WeakMap());
              if (removed) {
                console.log(`[DOMCleanupService] Successfully removed overlay ${index + 1}/${overlaysToRemove.length}`);
              }
            }
            
            // Remove from set either way
            this.overlaysBeingRemoved.delete(overlay);
            
            // Move to next overlay
            index++;
            
            // Use setTimeout for better performance and to avoid blocking the main thread
            const timeoutId = window.setTimeout(removeNext, 16); // ~60fps
          } else {
            // All overlays processed
            this.cleanupInProgress = false;
          }
        };
        
        // Start removing
        removeNext();
      } catch (error) {
        console.warn('[DOMCleanupService] Error during cleanup:', error);
        this.cleanupInProgress = false;
        this.overlaysBeingRemoved.clear();
      }
    };
    
    // Queue the operation
    operationQueue.queueOperation(cleanupOperation);
  }
}
