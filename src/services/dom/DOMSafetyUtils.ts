
import { isChildNode, isElement, isInDocument } from '@/types/dom';
import { safeRemoveElement } from '@/utils/domUtils';

/**
 * Utility class for safely performing DOM operations
 */
export class DOMSafetyUtils {
  /**
   * Safely removes a DOM element
   */
  public safeRemoveElement(element: Element | null, elementsMap?: WeakMap<Node, any>): boolean {
    return safeRemoveElement(element);
  }
  
  /**
   * Safely determines if an element is in the DOM
   */
  public isElementInDOM(element: Element): boolean {
    return isInDocument(element);
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
        if (safeRemoveElement(element)) {
          removedCount++;
        }
      });
      
      return removedCount;
    } catch (e) {
      console.warn(`Error removing elements with selector ${selector}:`, e);
      return 0;
    }
  }
  
  /**
   * Handle dynamic module import errors
   * Checks if the error is related to a dynamic import and cleans up if needed
   */
  public handleDynamicImportError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || String(error);
    const isDynamicImportError = (
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Unexpected token') && errorMessage.includes('imported') ||
      errorMessage.includes('Error loading chunk')
    );
    
    if (isDynamicImportError) {
      console.warn('Dynamic import error detected, cleaning DOM state:', errorMessage);
      this.resetBodyState();
      return true;
    }
    
    return false;
  }
}
