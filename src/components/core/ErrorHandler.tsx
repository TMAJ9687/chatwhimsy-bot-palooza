
import { useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUIState } from '@/context/UIStateContext';

interface ErrorHandlerProps {
  logoutInProgressRef: React.MutableRefObject<boolean>;
}

const ErrorHandler = ({ logoutInProgressRef }: ErrorHandlerProps) => {
  const { clearOverlays } = useUIState();
  
  // Use our new error handler hook
  useErrorHandler({
    onError: () => {
      // Reset body state
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      if (logoutInProgressRef.current) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Clear any open overlays
      clearOverlays();
    }
  });
  
  // This is a utility component - it doesn't render anything
  return null;
};

export default ErrorHandler;
