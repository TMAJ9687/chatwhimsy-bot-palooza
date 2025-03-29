
// Import DOM safety utilities
import { domRegistry } from '@/services/dom';

/**
 * Clean up DOM elements that might cause issues or block the UI
 * This is particularly important for modal dialogs and overlays
 */
export const performDOMCleanup = (): void => {
  try {
    console.log('Performing emergency DOM cleanup');
    
    // Reset body state first
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Use dom registry if available
    if (domRegistry) {
      domRegistry.cleanupOverlays();
    }
    
    // Additional cleanup for persistent overlay elements
    const overlaySelectors = [
      '.fixed.inset-0',
      '[data-radix-dialog-overlay]',
      '[data-radix-alert-dialog-overlay]',
      '[data-radix-portal]',
      '[role="dialog"]',
      '[aria-modal="true"]',
      '.backdrop',
      '.modal-backdrop'
    ];
    
    // Process each selector
    overlaySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            if (element.parentNode) {
              // Verify element is a child before removing
              const children = Array.from(element.parentNode.childNodes);
              if (children.includes(element as Node)) {
                try {
                  // Try the standard remove method first
                  element.remove();
                } catch (e) {
                  // If that fails, try removeChild with proper type assertion
                  if (element.parentNode && element.parentNode.contains(element)) {
                    // Properly cast to ChildNode to satisfy TypeScript
                    element.parentNode.removeChild(element as unknown as ChildNode);
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Error removing element with selector ${selector}:`, e);
          }
        });
      } catch (e) {
        console.warn(`Error processing selector ${selector}:`, e);
      }
    });
    
    // Additional handling for dynamic import failures
    cleanupDynamicImportArtifacts();
  } catch (e) {
    console.error('Error during DOM cleanup:', e);
  }
};

/**
 * Clean up artifacts that might be left from failed dynamic imports
 */
export const cleanupDynamicImportArtifacts = (): void => {
  try {
    // Handle script tags that might be in a broken state
    const scriptTags = document.querySelectorAll('script[src*="chunk"]');
    if (scriptTags.length > 0) {
      console.log(`Found ${scriptTags.length} potential chunk script tags`);
    }
    
    // Remove any error overlay elements that might be created by Vite/React
    const errorOverlays = document.querySelectorAll(
      '.error-overlay, #error-overlay, #vite-error-overlay, #react-error-overlay'
    );
    errorOverlays.forEach(overlay => {
      try {
        if (overlay.parentNode) {
          // Properly cast to ChildNode to satisfy TypeScript
          overlay.parentNode.removeChild(overlay as unknown as ChildNode);
        }
      } catch (e) {
        // Ignore individual removal errors
      }
    });
  } catch (e) {
    console.warn('Error cleaning dynamic import artifacts:', e);
  }
};

/**
 * Global handler for runtime errors including DOM related errors
 */
export const handleGlobalError = (error: any): void => {
  console.error('Global error handler caught:', error);
  
  const errorMessage = error?.message || String(error);
  
  // Check if this is a DOM-related error
  if (
    errorMessage.includes('removeChild') ||
    errorMessage.includes('appendChild') ||
    errorMessage.includes('child of this node') ||
    errorMessage.includes('Failed to execute') ||
    errorMessage.includes('dynamically imported module') ||
    errorMessage.includes('not a child') ||
    errorMessage.includes('parentNode') ||
    (errorMessage.includes('null') && errorMessage.includes('DOM'))
  ) {
    console.warn('DOM-related error detected, performing cleanup');
    performDOMCleanup();
  }
  
  // Additional check for dynamic import failures
  if (
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Error loading chunk') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Unexpected token')
  ) {
    console.warn('Dynamic import failure detected, performing specialized cleanup');
    cleanupDynamicImportArtifacts();
    
    // For severe import errors, consider triggering a page reload
    if (errorMessage.includes('Failed to fetch dynamically imported module')) {
      console.warn('Critical dynamic import failure, considering reload');
      
      // Only reload if we haven't tried recently (avoid reload loops)
      const lastReloadAttempt = sessionStorage.getItem('lastImportErrorReload');
      const now = Date.now();
      if (!lastReloadAttempt || (now - parseInt(lastReloadAttempt, 10)) > 60000) {
        sessionStorage.setItem('lastImportErrorReload', String(now));
        
        // Queue the reload to happen after current execution
        setTimeout(() => {
          console.warn('Reloading page due to dynamic import failure');
          window.location.reload();
        }, 2000);
      }
    }
  }
};

/**
 * Create a global error handler function
 */
export const createGlobalErrorHandler = () => {
  return (event: ErrorEvent) => {
    handleGlobalError(event.error || event);
    
    // Check if this is a DOM-related error that should be suppressed
    const errorMessage = event.message || String(event.error);
    
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('appendChild') || 
      errorMessage.includes('not a child') ||
      errorMessage.includes('parentNode') ||
      (errorMessage.includes('Failed to execute') && errorMessage.includes('on') && errorMessage.includes('Node'))
    ) {
      // Prevent default behavior for DOM errors
      event.preventDefault();
      event.stopPropagation();
      performDOMCleanup();
    }
  };
};

/**
 * Set up global error handling
 */
export const setupErrorHandling = (): void => {
  if (typeof window !== 'undefined') {
    // Set up global error handler
    window.addEventListener('error', (event) => {
      handleGlobalError(event.error || event);
      
      // Special handling for DOM errors
      const errorMessage = event.message || String(event.error);
      if (
        errorMessage.includes('removeChild') || 
        errorMessage.includes('appendChild') || 
        errorMessage.includes('not a child')
      ) {
        event.preventDefault();
        performDOMCleanup();
      }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handleGlobalError(event.reason);
      
      // Special handling for dynamic import failures in promises
      const errorMessage = event.reason?.message || String(event.reason);
      if (
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Error loading chunk')
      ) {
        event.preventDefault();
        cleanupDynamicImportArtifacts();
      }
    });
    
    // Handle chunk loading errors specifically
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (
        target && 
        target.tagName && 
        (target.tagName.toLowerCase() === 'script' || target.tagName.toLowerCase() === 'link')
      ) {
        console.warn('Resource loading error:', event);
        
        // Check if this is a chunk
        const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || '';
        if (src.includes('chunk') || src.includes('bundle')) {
          console.warn('Chunk loading error detected:', src);
          event.preventDefault();
          cleanupDynamicImportArtifacts();
        }
      }
    }, true); // Capture phase
  }
};
