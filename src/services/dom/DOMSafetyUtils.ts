
/**
 * Utility class for safely performing DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Safely removes a DOM element
   */
  public safeRemoveElement(element: Element): boolean {
    if (!element || !element.parentNode) return false;
    
    try {
      // First try the standard remove method
      if (typeof element.remove === 'function') {
        element.remove();
        return true;
      }
      
      // Fallback to removeChild with proper parent check
      const parent = element.parentNode;
      
      // Verify element is actually a child of the parent
      if (parent && parent.contains(element)) {
        // Only remove if it's a valid Element (which is a valid ChildNode)
        parent.removeChild(element);
        return true;
      }
    } catch (e) {
      console.warn('Error removing element:', e);
      return false;
    }
    
    return false;
  }
  
  /**
   * Safely determines if an element is in the DOM
   */
  public isElementInDOM(element: Element): boolean {
    return !!(element && document.contains(element));
  }
  
  /**
   * Resets body state
   */
  public resetBodyState(): void {
    if (!document.body) return;
    
    document.body.style.overflow = 'auto';
    document.body.classList.remove(
      'overflow-hidden', 
      'dialog-open', 
      'modal-open'
    );
  }
}
