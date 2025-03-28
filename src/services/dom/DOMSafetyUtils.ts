
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
      
      // Only attempt removal if the element has a parent
      if (element.parentNode) {
        // Check if element is still in the DOM
        if (!document.contains(element)) {
          console.log('[DOMSafetyUtils] Element is no longer in the DOM');
          return false;
        }
        
        // Double-check that the element is actually a child of its parent
        const parentChildNodes = Array.from(element.parentNode.childNodes);
        const isRealChild = parentChildNodes.includes(element);
        
        if (isRealChild) {
          // Remove the element
          element.parentNode.removeChild(element as ChildNode);
          return true;
        } else {
          // If the element is not a real child, don't try to remove it
          console.warn('[DOMSafetyUtils] Element is not a child of its parent node');
          return false;
        }
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
    
    document.body.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
  }
}
