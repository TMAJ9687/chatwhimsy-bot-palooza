
/**
 * Type-safe DOM operations utility
 */

// Create a proper type for ChildNode that includes remove method
export type SafeChildNode = ChildNode & {
  remove?: () => void;
};

/**
 * Safely removes an element from the DOM with proper type handling
 */
export const safeRemoveElement = (element: Element | null): boolean => {
  if (!element) return false;

  try {
    // Check if element is in the DOM
    if (document.body && !document.body.contains(element)) {
      return false;
    }

    // Modern browsers support element.remove()
    if ('remove' in element && typeof element.remove === 'function') {
      try {
        element.remove();
        return true;
      } catch (e) {
        console.warn('Modern remove method failed:', e);
      }
    }

    // Fallback to removeChild with proper typing
    if (element.parentNode) {
      try {
        element.parentNode.removeChild(element as unknown as ChildNode);
        return true;
      } catch (e) {
        console.warn('removeChild failed:', e);
      }
    }
  } catch (e) {
    console.warn('Error removing element:', e);
  }

  return false;
};

/**
 * Safely removes elements by selector
 */
export const safeRemoveElementsBySelector = (selector: string): number => {
  if (typeof document === 'undefined') return 0;
  
  try {
    const elements = document.querySelectorAll(selector);
    let removedCount = 0;
    
    elements.forEach(element => {
      if (safeRemoveElement(element)) {
        removedCount++;
      }
    });
    
    return removedCount;
  } catch (e) {
    console.warn(`Error removing elements with selector ${selector}:`, e);
    return 0;
  }
};

/**
 * Reset body state to prevent stuck UI
 */
export const resetBodyState = (): void => {
  if (!document.body) return;
  
  document.body.style.overflow = 'auto';
  document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
};

/**
 * Safely checks if an element is in the document
 */
export const isElementInDOM = (element: Element | null): boolean => {
  return !!element && !!document.body && document.body.contains(element);
};
