
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
      const parentChildNodes = Array.from(element.parentNode.childNodes);
      const isRealChild = parentChildNodes.includes(element);
      
      if (isRealChild) {
        // Use try-catch for the actual removal operation
        try {
          // Use more reliable parentNode.contains check before removal
          if (element.parentNode.contains(element)) {
            element.parentNode.removeChild(element);
            return true;
          } else {
            console.log('[DOMSafetyUtils] Element is not contained in parent, using safer .remove()');
            element.remove(); // Fallback to element.remove() which has additional checks
            return true;
          }
        } catch (e) {
          console.warn('[DOMSafetyUtils] Element removal failed:', e);
          return false;
        }
      } else {
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
          if (document.contains(el) && Array.from(el.parentNode.childNodes).includes(el)) {
            // First try the safer .remove() method
            try {
              el.remove();
              removedCount++;
            } catch (err) {
              // Fallback to parent.removeChild with additional validation
              if (el.parentNode && el.parentNode.contains(el)) {
                el.parentNode.removeChild(el);
                removedCount++;
              }
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
    // Store a weak reference to avoid memory leaks
    const elementRef = new WeakRef(element);
    
    return () => {
      try {
        const el = elementRef.deref();
        if (!el || !el.parentNode) return;
        
        // Verify element is still valid
        if (document.contains(el) && el.parentNode.contains(el)) {
          try {
            el.remove();
          } catch (err) {
            // Fallback with additional validation
            if (el.parentNode && Array.from(el.parentNode.childNodes).includes(el)) {
              el.parentNode.removeChild(el);
            }
          }
        }
      } catch (err) {
        console.warn('[DOMSafetyUtils] Error in safe removal function:', err);
      }
    };
  }
}
