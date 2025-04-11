
/**
 * Utility class for safe DOM operations with a more declarative approach
 */
export class DOMSafetyUtils {
  /**
   * Reset body state by removing classes and styles that might lock scrolling
   */
  public resetBodyState(): void {
    if (typeof document === 'undefined' || !document.body) return;
    
    try {
      // Use a direct assignment rather than manipulating style properties individually
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Use classList methods instead of manual manipulation
      document.body.classList.remove(
        'dialog-open',
        'overflow-hidden',
        'modal-open',
        'fixed',
        'inset-0'
      );
    } catch (error) {
      console.warn('[DOMSafetyUtils] Error resetting body state:', error);
    }
  }
  
  /**
   * Check if an element is still valid and attached to the DOM
   */
  public isElementValid(element: Element | null): boolean {
    if (!element) return false;
    
    try {
      return !!(document && 
                document.contains(element) && 
                element.parentNode && 
                element.parentNode.contains(element));
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Safely check if a portal container exists or create it
   */
  public ensurePortalContainer(id: string): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    
    try {
      let container = document.getElementById(id);
      
      if (!container) {
        container = document.createElement('div');
        container.id = id;
        
        if (document.body) {
          document.body.appendChild(container);
        } else {
          return null;
        }
      }
      
      return container;
    } catch (error) {
      console.error(`[DOMSafetyUtils] Error ensuring portal container ${id}:`, error);
      return null;
    }
  }

  /**
   * Safely remove an element with additional validation
   */
  public safeRemoveElement(element: Element | null, elements?: WeakMap<Node, any>): boolean {
    if (!element) return false;
    
    try {
      // Check if element is valid and attached to DOM
      if (this.isElementValid(element)) {
        // Modern browsers support element.remove()
        element.remove();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[DOMSafetyUtils] Error removing element:', error);
      return false;
    }
  }

  /**
   * Safely remove elements by selector
   */
  public safeRemoveElementsBySelector(selector: string): number {
    if (typeof document === 'undefined') return 0;
    
    try {
      const elements = document.querySelectorAll(selector);
      let removedCount = 0;
      
      elements.forEach(element => {
        if (this.safeRemoveElement(element)) {
          removedCount++;
        }
      });
      
      return removedCount;
    } catch (error) {
      console.warn(`[DOMSafetyUtils] Error removing elements with selector ${selector}:`, error);
      return 0;
    }
  }
}
