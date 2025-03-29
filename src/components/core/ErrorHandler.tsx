
import { useEffect, useRef } from 'react';
import { setupErrorHandling, performDOMCleanup, handleGlobalError } from '@/utils/errorHandler';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  const errorCountRef = useRef(0);
  const removeChildPatchedRef = useRef(false);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      // Set up error handlers
      setupErrorHandling();
      
      // Apply special patch for removeChild errors during logout
      if (!removeChildPatchedRef.current) {
        removeChildPatchedRef.current = true;
        console.log('[ErrorHandler] Setting up removeChild error protection');
        
        // Store original method for later restoration
        const originalRemoveChild = Node.prototype.removeChild;
        
        // Replace with safer version that won't throw during logout
        Node.prototype.removeChild = function(child) {
          // Skip validation during logout to prevent errors
          if (logoutInProgressRef.current) {
            console.log('[ErrorHandler] Safe removeChild during logout');
            // Check if child is actually a child, otherwise just return it without throwing
            if (this.contains(child)) {
              return originalRemoveChild.call(this, child);
            }
            // Return the node without throwing if not found during logout
            return child;
          }
          
          // For normal operation outside logout, use original with safe error handling
          try {
            return originalRemoveChild.call(this, child);
          } catch (e) {
            // Only suppress specific "not a child" errors
            if (e instanceof DOMException && 
                e.name === 'NotFoundError' && 
                e.message.includes('not a child')) {
              console.warn('[ErrorHandler] Suppressed removeChild error:', e.message);
              // Increment error count for tracking
              errorCountRef.current++;
              // Return the node to prevent error propagation
              return child;
            }
            // Re-throw other errors
            throw e;
          }
        };
        
        // Cleanup function to restore original method
        return () => {
          Node.prototype.removeChild = originalRemoveChild;
          removeChildPatchedRef.current = false;
        };
      }
      
      // Use capture to catch errors before they propagate
      const handleError = (event: ErrorEvent) => {
        const errorMessage = event.message || String(event.error);
        
        // Enhanced check for DOM-related errors
        if (
          errorMessage.includes('removeChild') || 
          errorMessage.includes('appendChild') || 
          errorMessage.includes('not a child') ||
          errorMessage.includes('parentNode') ||
          errorMessage.includes('The node to be removed') ||
          (errorMessage.includes('null') && errorMessage.includes('DOM')) ||
          errorMessage.includes('Failed to fetch dynamically imported module')
        ) {
          event.preventDefault();
          console.warn('[ErrorHandler] Caught error event:', errorMessage);
          
          // Track error count
          errorCountRef.current += 1;
          
          // Run cleanup
          performDOMCleanup();
          
          // If logout is in progress, ensure body classes are reset
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          // If we've seen too many errors, do emergency cleanup
          if (errorCountRef.current > 3) {
            console.warn('[ErrorHandler] Too many errors, clearing all modals');
            // Force a more aggressive cleanup
            try {
              handleGlobalError({ message: "Too many errors" });
            } catch (e) {
              // Ignore aggressive cleanup errors
            }
          }
        }
      };
      
      window.addEventListener('error', handleError, { capture: true });
      
      // Also handle unhandled promise rejections with enhanced detection
      const handleRejection = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || String(event.reason);
        
        // Enhanced check for DOM-related errors and dynamic import failures
        if (
          errorMessage.includes('removeChild') || 
          errorMessage.includes('appendChild') || 
          errorMessage.includes('not a child') ||
          errorMessage.includes('parentNode') ||
          errorMessage.includes('The node to be removed') ||
          (errorMessage.includes('null') && errorMessage.includes('DOM')) ||
          errorMessage.includes('Failed to fetch dynamically imported module')
        ) {
          event.preventDefault();
          console.warn('[ErrorHandler] Caught unhandled promise rejection:', errorMessage);
          
          // Track error count
          errorCountRef.current += 1;
          
          // Run cleanup
          performDOMCleanup();
          
          // If logout is in progress, ensure body classes are reset
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          // If we've seen too many errors, do emergency cleanup
          if (errorCountRef.current > 3) {
            console.warn('[ErrorHandler] Too many errors, clearing all modals');
            // Force a more aggressive cleanup
            try {
              handleGlobalError({ message: "Too many errors" });
            } catch (e) {
              // Ignore aggressive cleanup errors
            }
          }
        }
      };
      
      window.addEventListener('unhandledrejection', handleRejection, { capture: true });
      
      // Run initial cleanup to clear any stale overlays
      performDOMCleanup();
      
      return () => {
        window.removeEventListener('error', handleError, { capture: true });
        window.removeEventListener('unhandledrejection', handleRejection, { capture: true });
        errorHandlerSetRef.current = false;
      };
    }
  }, [logoutInProgressRef]);
  
  return null;
};

export default ErrorHandler;
