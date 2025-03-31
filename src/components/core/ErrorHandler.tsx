
import { useEffect, useRef } from 'react';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      // Set up basic error handlers
      console.log('[ErrorHandler] Setting up error protection');
      
      // Handle global errors
      const handleError = (event: ErrorEvent) => {
        const errorMessage = event.message || String(event.error);
        
        console.warn('[ErrorHandler] Caught error event:', errorMessage);
        
        // If logout is in progress, ensure body classes are reset
        if (logoutInProgressRef.current && document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        }
      };
      
      // Also handle unhandled promise rejections
      const handleRejection = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || String(event.reason);
        
        console.warn('[ErrorHandler] Caught unhandled promise rejection:', errorMessage);
        
        // If logout is in progress, ensure body classes are reset
        if (logoutInProgressRef.current && document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        }
      };
      
      window.addEventListener('error', handleError, { capture: true });
      window.addEventListener('unhandledrejection', handleRejection, { capture: true });
      
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
