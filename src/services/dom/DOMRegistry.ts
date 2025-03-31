
/**
 * A centralized registry for tracking DOM elements and their lifecycle
 */
import { DOMCleanupService } from './DOMCleanupService';
import { DOMOperationQueue } from './DOMOperationQueue';
import { DOMSafetyUtils } from './DOMSafetyUtils';

class DOMRegistry {
  private static instance: DOMRegistry;
  private elements = new WeakMap<Node, { parent: Node | null; registered: number }>();
  private cleanupService: DOMCleanupService;
  private operationQueue: DOMOperationQueue;
  private safetyUtils: DOMSafetyUtils;
  private operations = new Map<string, { timestamp: number }>();

  private constructor() {
    this.cleanupService = new DOMCleanupService();
    this.operationQueue = new DOMOperationQueue();
    this.safetyUtils = new DOMSafetyUtils();
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
   * Register an operation for tracking
   */
  public registerOperation(id: string): void {
    this.operations.set(id, {
      timestamp: Date.now()
    });
  }

  /**
   * Unregister an operation
   */
  public unregisterOperation(id: string): void {
    this.operations.delete(id);
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
    return this.safetyUtils.safeRemoveElement(element, this.elements);
  }

  /**
   * Queue an operation to run when safe
   */
  public queueOperation(operation: () => void): void {
    this.operationQueue.queueOperation(operation);
  }

  /**
   * Clean up overlay elements
   */
  public cleanupOverlays(): void {
    this.cleanupService.cleanupOverlays(this.operationQueue, this.safetyUtils);
  }

  /**
   * Clean up resources and timeouts
   */
  public cleanup(): void {
    this.operationQueue.cleanup();
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
