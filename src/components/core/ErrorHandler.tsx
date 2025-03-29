
import { useEffect, useRef } from 'react';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const errorHandlerSetRef = useRef(false);
  
  useEffect(() => {
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      const handleError = (event: ErrorEvent) => {
        if (
          event.message && 
          event.message.includes('removeChild') && 
          event.message.includes('not a child')
        ) {
          event.preventDefault();
          console.warn('Caught removeChild error during navigation, suppressing');
          
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          try {
            document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
              .forEach(el => {
                try {
                  if (el.parentNode) {
                    const isChild = Array.from(el.parentNode.childNodes).includes(el);
                    if (isChild) {
                      el.remove();
                    }
                  }
                } catch (e) {
                  // Silent catch
                }
              });
          } catch (e) {
            // Silent catch
          }
          
          return false;
        }
      };
      
      window.addEventListener('error', handleError, { capture: true });
      
      return () => {
        window.removeEventListener('error', handleError, { capture: true });
        errorHandlerSetRef.current = false;
      };
    }
  }, [logoutInProgressRef]);
  
  return null;
};

export default ErrorHandler;
