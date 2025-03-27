
/**
 * Service for queuing and executing DOM operations with debouncing
 */
export class DOMOperationQueue {
  private operationInProgress = false;
  private pendingOperations: Array<() => void> = [];
  private timeouts: number[] = [];
  private operationDebounceTime = 50; // ms
  private lastOperationTime = 0;

  /**
   * Queue an operation to run when safe
   */
  public queueOperation(operation: () => void): void {
    this.pendingOperations.push(operation);
    
    // Process the queue if no operation is in progress
    if (!this.operationInProgress) {
      this.processPendingOperations();
    }
  }

  /**
   * Process pending operations with debouncing
   */
  private processPendingOperations(): void {
    // Don't run if already processing or no operations
    if (this.operationInProgress || this.pendingOperations.length === 0) {
      return;
    }
    
    const now = Date.now();
    // Throttle operations
    if (now - this.lastOperationTime < this.operationDebounceTime) {
      const timeoutId = window.setTimeout(
        () => this.processPendingOperations(), 
        this.operationDebounceTime
      );
      this.timeouts.push(timeoutId);
      return;
    }
    
    this.operationInProgress = true;
    this.lastOperationTime = now;
    
    queueMicrotask(() => {
      try {
        // Execute the next operation
        const nextOperation = this.pendingOperations.shift();
        if (nextOperation) {
          nextOperation();
        }
      } catch (error) {
        console.warn('[DOMOperationQueue] Error during operation:', error);
      } finally {
        this.operationInProgress = false;
        
        // Process next operation after a small delay
        const timeoutId = window.setTimeout(() => {
          if (this.pendingOperations.length > 0) {
            this.processPendingOperations();
          }
        }, 10);
        
        this.timeouts.push(timeoutId);
      }
    });
  }

  /**
   * Clean up resources and timeouts
   */
  public cleanup(): void {
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts = [];
    this.pendingOperations = [];
    this.operationInProgress = false;
  }
}
