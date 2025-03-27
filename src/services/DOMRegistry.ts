
/**
 * A singleton service that manages DOM element tracking and safe cleanup
 * to prevent "Failed to execute 'removeChild' on 'Node'" errors
 */
class DOMRegistry {
  private static instance: DOMRegistry;
  private elements = new WeakMap<Node, { parent: Node | null; registered: number }>();
  private operationInProgress = false;
  private pendingCleanups: Array<() => void> = [];
  private cleanupTimeouts: number[] = [];
  private operationDebounceTime = 50; // ms
  private lastOperationTime = 0;

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

      // Start observing document body for DOM changes
      if (typeof document !== 'undefined' && document.body) {
        observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
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
      return this.elements.has(node) && !!node.parentNode;
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
        } else {
          console.warn('[DOMRegistry] Element is not a real child of its parent node');
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
    this.pendingCleanups.push(operation);
    
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
    if (this.operationInProgress || this.pendingCleanups.length === 0) {
      return;
    }
    
    const now = Date.now();
    // Throttle operations
    if (now - this.lastOperationTime < this.operationDebounceTime) {
      const timeoutId = window.setTimeout(
        () => this.processPendingOperations(), 
        this.operationDebounceTime
      );
      this.cleanupTimeouts.push(timeoutId);
      return;
    }
    
    this.operationInProgress = true;
    this.lastOperationTime = now;
    
    queueMicrotask(() => {
      try {
        // Execute the next operation
        const nextOperation = this.pendingCleanups.shift();
        if (nextOperation) {
          nextOperation();
        }
      } catch (error) {
        console.warn('[DOMRegistry] Error during operation:', error);
      } finally {
        this.operationInProgress = false;
        
        // Process next operation after a small delay
        const timeoutId = window.setTimeout(() => {
          if (this.pendingCleanups.length > 0) {
            this.processPendingOperations();
          }
        }, 10);
        
        this.cleanupTimeouts.push(timeoutId);
      }
    });
  }

  /**
   * Clean up overlay elements using a staged approach
   */
  public cleanupOverlays(): void {
    if (this.operationInProgress) {
      // Queue if another operation is in progress
      this.queueOperation(() => this.cleanupOverlays());
      return;
    }
    
    const cleanupOperation = () => {
      if (typeof document === 'undefined' || !document.body) return;
      
      // Reset body scroll
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
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
          console.warn(`[DOMRegistry] Error finding selector ${selector}:`, e);
        }
      });
      
      // Then remove them sequentially with delays
      if (overlaysToRemove.length > 0) {
        let index = 0;
        
        const removeNext = () => {
          if (index < overlaysToRemove.length) {
            const overlay = overlaysToRemove[index];
            this.safeRemoveElement(overlay);
            index++;
            
            const timeoutId = window.setTimeout(removeNext, 16); // ~60fps
            this.cleanupTimeouts.push(timeoutId);
          }
        };
        
        removeNext();
      }
    };
    
    this.queueOperation(cleanupOperation);
  }

  /**
   * Clean up resources and timeouts
   */
  public cleanup(): void {
    this.cleanupTimeouts.forEach(id => window.clearTimeout(id));
    this.cleanupTimeouts = [];
    this.pendingCleanups = [];
    this.operationInProgress = false;
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
