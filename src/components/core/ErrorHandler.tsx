
import { useEffect, useRef } from 'react';
import { createGlobalErrorHandler, performDOMCleanup, GlobalErrorHandler } from '@/utils/errorHandler';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  const errorCountRef = useRef(0);
  const handlerRef = useRef<GlobalErrorHandler | null>(null);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      // Create handler instance
      handlerRef.current = new GlobalErrorHandler();
      
      // Set up error handlers
      const handleError = createGlobalErrorHandler();
      
      // Use capture to catch errors before they propagate
      window.addEventListener('error', handleError, { capture: true });
      
      // Also handle unhandled promise rejections with enhanced detection
      const handleRejection = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || String(event.reason);
        
        // Enhanced check for DOM-related errors
        if (
          errorMessage.includes('removeChild') || 
          errorMessage.includes('appendChild') || 
          errorMessage.includes('not a child') ||
          errorMessage.includes('parentNode') ||
          errorMessage.includes('The node to be removed') ||
          (errorMessage.includes('null') && errorMessage.includes('DOM'))
        ) {
          event.preventDefault();
          console.warn('[ErrorHandler] Caught unhandled promise rejection with DOM error:', errorMessage);
          
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
            console.warn('[ErrorHandler] Too many DOM errors, clearing all modals');
            // Force a more aggressive cleanup
            try {
              if (handlerRef.current) {
                handlerRef.current.handleError({ message: "Too many DOM errors" });
              }
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
