
/**
 * A singleton service that manages DOM element tracking and safe cleanup
 * to prevent "Failed to execute 'removeChild' on 'Node'" errors
 */
class DOMRegistry {
  private static instance: DOMRegistry;
  private elements = new WeakMap<Node, { parent: Node | null; registered: number }>();
  private operationQueue: Array<() => void> = [];
  private isProcessingQueue = false;
  private cleanupTimeoutIds: number[] = [];
  private lastCleanupTime = 0;
  private readonly debounceTime = 50; // ms
  private readonly maxQueueSize = 100;

  private constructor() {
    // Initialize singleton
    this.setupMutationObserver();
  }

  public static getInstance(): DOMRegistry {
    if (!DOMRegistry.instance) {
      DOMRegistry.instance = new DOMRegistry();
    }
    return DOMRegistry.instance;
  }

  /**
   * Setup mutation observer to detect DOM changes and maintain registry integrity
   */
  private setupMutationObserver(): void {
    try {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            // Track removed nodes
            mutation.removedNodes.forEach(node => {
              this.elements.delete(node);
            });
          }
        });
      });

      // Start observing document body when it becomes available
      if (typeof document !== 'undefined') {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        } else {
          // If body isn't available yet, wait for it
          document.addEventListener('DOMContentLoaded', () => {
            if (document.body) {
              observer.observe(document.body, { childList: true, subtree: true });
            }
          });
        }
      }
    } catch (error) {
      console.warn('[DOMRegistry] Error setting up MutationObserver:', error);
    }
  }

  /**
   * Register a DOM node for tracking
   */
  public registerNode(node: Node | null): void {
    if (!node) return;
    
    try {
      // Store reference to parent node at registration time
      this.elements.set(node, { 
        parent: node.parentNode,
        registered: Date.now()
      });
    } catch (error) {
      console.warn('[DOMRegistry] Error registering node:', error);
    }
  }

  /**
   * Check if a node is registered and valid for removal
   */
  public isNodeValid(node: Node | null): boolean {
    if (!node) return false;
    
    try {
      // A node is valid if it has a parent node and is registered or if it's a direct child of its parent
      return (this.elements.has(node) && !!node.parentNode) || 
             (!!node.parentNode && Array.from(node.parentNode.childNodes).includes(node));
    } catch (error) {
      console.warn('[DOMRegistry] Error checking node validity:', error);
      return false;
    }
  }

  /**
   * Safely remove an element with additional validation
   */
  public safeRemoveElement(element: Element | null): boolean {
    if (!element) return false;
    
    try {
      // Remove from our registry
      this.elements.delete(element);
      
      // Only attempt removal if the element has a parent
      if (element.parentNode) {
        // Double-check that the element is actually a child of its parent
        const parentChildNodes = Array.from(element.parentNode.childNodes);
        const isRealChild = parentChildNodes.includes(element);
        
        if (isRealChild) {
          element.parentNode.removeChild(element);
          return true;
        }
      }
    } catch (e) {
      console.warn('[DOMRegistry] Safe element removal failed:', e);
    }
    
    return false;
  }

  /**
   * Queue an operation to run when safe
   */
  public queueOperation(operation: () => void): void {
    // Limit queue size to prevent memory issues
    if (this.operationQueue.length >= this.maxQueueSize) {
      this.operationQueue.shift(); // Remove oldest operation
    }
    
    this.operationQueue.push(operation);
    
    // Process the queue if no operation is in progress
    if (!this.isProcessingQueue) {
      this.processOperationQueue();
    }
  }

  /**
   * Process queued operations with debouncing
   */
  private processOperationQueue(): void {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastCleanupTime < this.debounceTime) {
      const timeoutId = window.setTimeout(
        () => this.processOperationQueue(), 
        this.debounceTime
      );
      this.cleanupTimeoutIds.push(timeoutId);
      return;
    }
    
    this.isProcessingQueue = true;
    this.lastCleanupTime = now;
    
    // Use queueMicrotask for more reliable timing
    queueMicrotask(() => {
      try {
        // Execute the next operation
        const nextOperation = this.operationQueue.shift();
        if (nextOperation) {
          nextOperation();
        }
      } catch (error) {
        console.warn('[DOMRegistry] Error during queued operation:', error);
      } finally {
        this.isProcessingQueue = false;
        
        // Process next operation with a small delay
        if (this.operationQueue.length > 0) {
          const timeoutId = window.setTimeout(() => {
            this.processOperationQueue();
          }, 10);
          
          this.cleanupTimeoutIds.push(timeoutId);
        }
      }
    });
  }

  /**
   * Clean up overlay elements with improved error handling
   */
  public cleanupOverlays(): void {
    const now = Date.now();
    
    // Debounce cleanup operations
    if (now - this.lastCleanupTime < 100) {
      return;
    }
    
    this.lastCleanupTime = now;
    
    // Queue the cleanup operation
    this.queueOperation(() => {
      if (!this.isDOMReady()) return;
      
      // Reset body scroll
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      try {
        // Combined selectors for potential overlay elements
        const selectors = [
          '.fixed.inset-0.z-50',
          '.fixed.inset-0.bg-black\\/80',
          '[data-radix-dialog-overlay]',
          '[data-radix-alert-dialog-overlay]',
          '.vaul-overlay',
          '.backdrop',
          '.modal-backdrop',
          '[data-overlay]',
          '[role="dialog"]',
          '.radix-portal',
          '.dialog-portal'
        ];
        
        // Collect all overlays that are still in the DOM
        const overlaysToRemove: Element[] = [];
        
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(overlay => {
              if (overlay.parentNode) {
                overlaysToRemove.push(overlay);
              }
            });
          } catch (e) {
            console.warn(`[DOMRegistry] Error finding selector ${selector}:`, e);
          }
        });
        
        // Process overlays in chunks to avoid blocking the main thread
        if (overlaysToRemove.length > 0) {
          const processChunk = (startIdx: number, chunkSize: number) => {
            const endIdx = Math.min(startIdx + chunkSize, overlaysToRemove.length);
            
            for (let i = startIdx; i < endIdx; i++) {
              try {
                this.safeRemoveElement(overlaysToRemove[i]);
              } catch (e) {
                console.warn('[DOMRegistry] Error removing overlay:', e);
              }
            }
            
            // Process next chunk if needed
            if (endIdx < overlaysToRemove.length) {
              const timeoutId = window.setTimeout(() => {
                processChunk(endIdx, chunkSize);
              }, 16); // ~60fps
              this.cleanupTimeoutIds.push(timeoutId);
            }
          };
          
          // Start processing in chunks of 5
          processChunk(0, 5);
        }
      } catch (error) {
        console.warn('[DOMRegistry] Error during overlay cleanup:', error);
      }
    });
  }

  /**
   * Clean up resources and timeouts
   */
  public cleanup(): void {
    this.cleanupTimeoutIds.forEach(id => window.clearTimeout(id));
    this.cleanupTimeoutIds = [];
    this.operationQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Check if DOM is ready for operations
   */
  public isDOMReady(): boolean {
    return typeof document !== 'undefined' && 
           !!document?.body && 
           !!document?.documentElement;
  }
}

// Export singleton instance
export const domRegistry = DOMRegistry.getInstance();
