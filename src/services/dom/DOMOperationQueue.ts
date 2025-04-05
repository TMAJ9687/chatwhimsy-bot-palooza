
/**
 * Queue for safely managing DOM operations
 */
export class DOMOperationQueue {
  private queue: Array<() => void> = [];
  private processing = false;
  private timeouts: Set<NodeJS.Timeout> = new Set();
  
  /**
   * Queue an operation to run when safe
   */
  public queueOperation(operation: () => void): void {
    this.queue.push(operation);
    this.processQueue();
  }
  
  /**
   * Process the queue of operations
   */
  private processQueue(): void {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    // Use requestAnimationFrame to sync with browser painting
    const rafId = requestAnimationFrame(() => {
      const operation = this.queue.shift();
      
      if (operation) {
        try {
          operation();
        } catch (error) {
          console.warn('[DOMOperationQueue] Error executing operation:', error);
        }
      }
      
      this.processing = false;
      
      // If there are more operations in the queue, process them
      if (this.queue.length > 0) {
        // Use a timeout to prevent long-running operations from blocking the UI
        const timeoutId = setTimeout(() => {
          this.timeouts.delete(timeoutId);
          this.processQueue();
        }, 0);
        this.timeouts.add(timeoutId);
      }
    });
  }
  
  /**
   * Clear the queue and all pending timeouts
   */
  public cleanup(): void {
    this.queue = [];
    this.processing = false;
    
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }
}
