
/**
 * Utility service for safely performing DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Safely remove an element with additional validation
   */
  public safeRemoveElement(element: Element | null, elementsRegistry?: WeakMap<Node, any>): boolean {
    if (!element) return false;
    
    try {
      // Remove from registry if provided
      if (elementsRegistry) {
        elementsRegistry.delete(element);
      }
      
      // Enhanced validation before attempting removal
      if (!element.parentNode) {
        console.log('[DOMSafetyUtils] Element has no parent node, skipping removal');
        return false;
      }
      
      // Check if element is still in the DOM
      if (!document.contains(element)) {
        console.log('[DOMSafetyUtils] Element is no longer in the DOM');
        return false;
      }
      
      // Double-check that the element is actually a child of its parent
      // Use Array.prototype.includes for more reliable child node checking
      const parentChildNodes = Array.from(element.parentNode.childNodes);
      const isRealChild = parentChildNodes.includes(element);
      
      if (!isRealChild) {
        console.warn('[DOMSafetyUtils] Element is not a child of its parent node');
        return false;
      }
      
      // Use try-catch for the actual removal operation
      try {
        // First try the safer element.remove() method
        element.remove();
        return true;
      } catch (e) {
        console.log('[DOMSafetyUtils] element.remove() failed, trying parentNode.removeChild');
        
        // Double check again right before removal
        if (element.parentNode && 
            document.contains(element) && 
            document.contains(element.parentNode) && 
            Array.from(element.parentNode.childNodes).includes(element)) {
          element.parentNode.removeChild(element);
          return true;
        } else {
          console.warn('[DOMSafetyUtils] Cannot safely remove element - parent/child relationship issue');
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
    
    // Use try-catch for safety
    try {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    } catch (e) {
      console.warn('[DOMSafetyUtils] Error resetting body state:', e);
    }
  }

  /**
   * Safely remove an element by selector with enhanced validation
   */
  public safeRemoveElementsBySelector(selector: string): number {
    if (typeof document === 'undefined') return 0;
    
    let removedCount = 0;
    try {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(el => {
        try {
          if (!el.parentNode) return;
          
          // Verify the element is still in the DOM and a child of its parent
          if (!document.contains(el)) {
            console.log(`[DOMSafetyUtils] Element from selector ${selector} is not in DOM, skipping`);
            return;
          }
          
          // Double-check that the element is actually a child of its parent
          const parentChildNodes = Array.from(el.parentNode.childNodes);
          const isRealChild = parentChildNodes.includes(el);
          
          if (!isRealChild) {
            console.log(`[DOMSafetyUtils] Element from selector ${selector} is not a child of its parent, skipping`);
            return;
          }
          
          // First try the safer .remove() method
          try {
            el.remove();
            removedCount++;
          } catch (err) {
            console.log(`[DOMSafetyUtils] element.remove() failed for selector ${selector}, trying parentNode.removeChild`);
            
            // Final validation right before removal
            if (el.parentNode && 
                document.contains(el) && 
                document.contains(el.parentNode) && 
                Array.from(el.parentNode.childNodes).includes(el)) {
              el.parentNode.removeChild(el);
              removedCount++;
            }
          }
        } catch (err) {
          console.warn(`[DOMSafetyUtils] Error removing element by selector ${selector}:`, err);
        }
      });
    } catch (e) {
      console.warn(`[DOMSafetyUtils] Error in safeRemoveElementsBySelector ${selector}:`, e);
    }
    
    return removedCount;
  }

  /**
   * Create a safe removal function that validates DOM state before removal
   * This is useful for cleanup functions in useEffect
   */
  public createSafeRemovalFn(element: Element | null): () => void {
    // Store a reference to the element
    let elementRef = element;
    
    return () => {
      try {
        const el = elementRef;
        if (!el || !el.parentNode) return;
        
        // Verify element is still valid and in DOM
        if (!document.contains(el)) {
          console.log('[DOMSafetyUtils] Element is no longer in the DOM, skipping removal');
          elementRef = null;
          return;
        }
        
        // Double-check that the element is actually a child of its parent
        const parentChildNodes = Array.from(el.parentNode.childNodes);
        const isRealChild = parentChildNodes.includes(el);
        
        if (!isRealChild) {
          console.log('[DOMSafetyUtils] Element is not a child of its parent, skipping removal');
          elementRef = null;
          return;
        }
        
        // First try the safer element.remove() method
        try {
          el.remove();
        } catch (err) {
          console.log('[DOMSafetyUtils] element.remove() failed, trying parentNode.removeChild');
          
          // Final validation before removal
          if (el.parentNode && el.parentNode.contains(el)) {
            el.parentNode.removeChild(el);
          }
        }
        
        // Clear the reference after attempted removal
        elementRef = null;
      } catch (err) {
        console.warn('[DOMSafetyUtils] Error in safe removal function:', err);
        // Clear reference even if there was an error
        elementRef = null;
      }
    };
  }
  
  /**
   * Verify if an element is safe to remove
   * Returns true if the element is valid and ready for removal
   */
  public isElementSafeToRemove(element: Element | null): boolean {
    if (!element || !element.parentNode) return false;
    
    try {
      // Check if element is still in the DOM
      if (!document.contains(element)) return false;
      
      // Check if element is a child of its parent
      const parentChildNodes = Array.from(element.parentNode.childNodes);
      return parentChildNodes.includes(element);
    } catch (e) {
      console.warn('[DOMSafetyUtils] Error checking element safety:', e);
      return false;
    }
  }
}
