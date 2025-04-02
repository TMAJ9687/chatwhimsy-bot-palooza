
import { useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { performDOMCleanup } from '@/utils/errorHandler';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  // Use our error handler hook
  useErrorHandler({
    onError: () => {
      // Reset body state directly without depending on UIStateContext
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      if (logoutInProgressRef.current) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Clean up any overlays
      performDOMCleanup();
    }
  });
  
  // This is a utility component - it doesn't render anything
  return null;
};

export default ErrorHandler;
