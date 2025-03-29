
/**
 * Utility class for safely performing DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Safely removes a DOM element
   */
  public safeRemoveElement(element: Element | null, elementsMap?: WeakMap<Node, any>): boolean {
    if (!element || !element.parentNode) return false;
    
    try {
      // First verify the element is actually in the DOM
      if (!document.contains(element)) return false;
      
      // First try the standard remove method
      if (typeof element.remove === 'function') {
        element.remove();
        return true;
      }
      
      // Fallback to removeChild with extra safety checks
      const parent = element.parentNode;
      
      // Verify element is actually a child of the parent
      if (parent && parent.contains(element)) {
        const childNodes = Array.from(parent.childNodes);
        if (childNodes.includes(element as Node)) {
          // Type assertion needed for TypeScript compatibility
          parent.removeChild(element as unknown as ChildNode);
          return true;
        }
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

  /**
   * Safely removes elements by selector
   * @returns Number of elements removed
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
    } catch (e) {
      console.warn(`Error removing elements with selector ${selector}:`, e);
      return 0;
    }
  }
}
