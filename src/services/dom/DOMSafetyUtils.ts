
/**
 * Utility service for safely performing DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Safely remove an element with additional validation
   */
  public safeRemoveElement(element: Element | null, elementsRegistry: WeakMap<Node, any>): boolean {
    if (!element) return false;
    
    try {
      // Remove from registry first
      elementsRegistry.delete(element);
      
      // Check if still in DOM and has parent before attempting removal
      if (!element.parentNode) {
        return false;
      }
      
      // Check if element is still in the DOM
      if (!document.contains(element)) {
        console.log('[DOMSafetyUtils] Element is no longer in the DOM');
        return false;
      }
      
      // Double-check that the element is actually a child of its parent
      const parentChildNodes = Array.from(element.parentNode.childNodes);
      const isRealChild = parentChildNodes.includes(element);
      
      if (isRealChild) {
        // Use try-catch for the actual removal operation
        try {
          // Remove the element
          element.remove(); // Use safer .remove() method instead of parentNode.removeChild
          return true;
        } catch (e) {
          console.warn('[DOMSafetyUtils] Element removal failed:', e);
          return false;
        }
      } else {
        // If the element is not a real child, don't try to remove it
        console.warn('[DOMSafetyUtils] Element is not a child of its parent node');
        return false;
      }
    } catch (e) {
      console.warn('[DOMSafetyUtils] Safe element removal failed:', e);
    }
    
    return false;
  }

  /**
   * Reset body element styles and classes
   */
  public resetBodyState(): void {
    if (typeof document === 'undefined' || !document.body) return;
    
    // Use try-catch for safety
    try {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    } catch (e) {
      console.warn('[DOMSafetyUtils] Error resetting body state:', e);
    }
  }
}
