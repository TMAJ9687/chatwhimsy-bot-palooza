
import { useEffect, useRef } from 'react';
import { setupErrorHandling, performDOMCleanup, handleGlobalError } from '@/utils/errorHandler';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  const errorCountRef = useRef(0);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      // Set up error handlers
      setupErrorHandling();
      
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
