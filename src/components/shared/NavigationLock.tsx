
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';

const NavigationLock: React.FC = () => {
  const location = useLocation();
  const { clearOverlays } = useUIState();
  
  // Clean up UI state on navigation
  useEffect(() => {
    // Clear any active overlays/modals when route changes
    clearOverlays();
    
    // Reset body styles declaratively
    const resetBodyStyles = () => {
      // Avoid direct style manipulation - set a class on body instead
      if (document.body) {
        document.body.classList.remove('dialog-open', 'modal-open', 'overflow-hidden');
      }
    };
    
    resetBodyStyles();
    
    // This effect runs on every navigation change
  }, [location.pathname, clearOverlays]);
  
  return null;
};

export default NavigationLock;
