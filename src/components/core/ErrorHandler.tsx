
import { useEffect, useRef } from 'react';
import { performDOMCleanup } from '@/utils/errorHandler';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      const handleError = (event: ErrorEvent) => {
        // Handle DOM removeChild errors
        if (
          event.message && 
          event.message.includes('removeChild') && 
          event.message.includes('not a child')
        ) {
          event.preventDefault();
          console.warn('Caught removeChild error during navigation, suppressing');
          
          // Reset body state
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          // Perform full DOM cleanup
          performDOMCleanup();
          
          return false;
        }
      };
      
      // Use capture phase to catch errors before they propagate
      window.addEventListener('error', handleError, { capture: true });
      
      // Also handle unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || String(event.reason);
        
        if (
          errorMessage.includes('removeChild') || 
          errorMessage.includes('appendChild') || 
          errorMessage.includes('not a child')
        ) {
          event.preventDefault();
          console.warn('Unhandled promise rejection with DOM error:', errorMessage);
          performDOMCleanup();
        }
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
      
      return () => {
        window.removeEventListener('error', handleError, { capture: true });
        window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
        errorHandlerSetRef.current = false;
      };
    }
  }, [logoutInProgressRef]);
  
  return null;
};

export default ErrorHandler;
