
/**
 * Utility class for safe DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Reset body state by removing classes and styles that might lock scrolling
   */
  public resetBodyState(): void {
    if (typeof document === 'undefined' || !document.body) return;
    
    try {
      // Reset overflow and other properties that might be set
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Remove classes that might be added by UI libraries
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
   * Safely remove an element with additional validation
   */
  public safeRemoveElement(element: Element | null, elements?: WeakMap<Node, any>): boolean {
    if (!element) return false;
    
    try {
      // Basic validations before attempting removal
      if (!element.parentNode) {
        return false;
      }
      
      // Check that the element is actually in the DOM
      if (!document || !document.contains(element)) {
        return false;
      }
      
      // Verify that the element is still a child of its parent
      const parent = element.parentNode;
      if (!parent.contains(element)) {
        return false;
      }
      
      // Remove element from registry if provided
      if (elements) {
        elements.delete(element);
      }
      
      // Use a safer approach for element removal
      try {
        // First check if the element is still in the DOM and has a parent
        if (document.contains(element) && parent && parent.contains(element)) {
          // First try the modern Element.remove() method
          element.remove();
          return true;
        }
      } catch (e) {
        try {
          // If remove() fails, try removeChild() as fallback
          if (parent && document.contains(parent) && parent.contains(element)) {
            parent.removeChild(element);
            return true;
          }
        } catch (innerError) {
          console.warn('[DOMSafetyUtils] Failed to remove element using both methods');
        }
      }
    } catch (error) {
      console.warn('[DOMSafetyUtils] Error removing element:', error);
    }
    
    return false;
  }
  
  /**
   * Safely remove elements by selector
   */
  public safeRemoveElementsBySelector(selector: string): number {
    if (typeof document === 'undefined') return 0;
    
    try {
      const elements = document.querySelectorAll(selector);
      let count = 0;
      
      elements.forEach(element => {
        if (this.safeRemoveElement(element)) {
          count++;
        }
      });
      
      return count;
    } catch (error) {
      console.warn(`[DOMSafetyUtils] Error removing elements with selector ${selector}:`, error);
      return 0;
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
}
