
/**
 * DEPRECATED: This service has been replaced with React-based implementations.
 * This file is kept for backward compatibility but should not be used for new code.
 * Use the UIContext and related hooks instead.
 */
import { DOMOperationQueue } from './DOMOperationQueue';
import { DOMSafetyUtils } from './DOMSafetyUtils';

export class DOMCleanupService {
  private cleanupInProgress = false;
  private overlaysBeingRemoved = new Set<Element>();
  private isMounted = true; 

  constructor() {
    this.isMounted = true;
    console.warn(
      'DOMCleanupService is deprecated. Please use UIContext and React components instead.'
    );
  }

  public unmount(): void {
    this.isMounted = false;
    this.overlaysBeingRemoved.clear();
  }

  public cleanupOverlays(
    operationQueue: DOMOperationQueue,
    safetyUtils: DOMSafetyUtils
  ): void {
    // This implementation is kept for backward compatibility
    // but has been refactored to minimize direct DOM manipulation
    
    console.warn(
      'cleanupOverlays is deprecated. Use UIContext for declarative UI management.'
    );

    if (this.cleanupInProgress || !this.isMounted) return;

    const cleanupOperation = () => {
      // Minimal implementation for backward compatibility
      if (typeof document === 'undefined' || !document.body || !this.isMounted) return;
      
      this.cleanupInProgress = true;
      
      try {
        // Reset body scroll in a way that's compatible with React
        if (document.body) {
          document.body.style.overflow = '';
          document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        }
        
        this.cleanupInProgress = false;
      } catch (error) {
        console.warn('Error during cleanup:', error);
        this.cleanupInProgress = false;
        this.overlaysBeingRemoved.clear();
      }
    };
    
    operationQueue.queueOperation(cleanupOperation);
  }
  
  public emergencyCleanup(safetyUtils: DOMSafetyUtils): void {
    console.warn(
      'emergencyCleanup is deprecated. Use UIContext for declarative UI management.'
    );
    
    // Minimal implementation for backward compatibility
    if (document?.body) {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    }
  }
}
