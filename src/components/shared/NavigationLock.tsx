
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

const NavigationLock: React.FC = () => {
  const location = useLocation();
  const { clearOverlays } = useUIState();
  const { cleanupOverlays } = useSafeDOMOperations();
  
  // Clean up UI state on navigation
  useEffect(() => {
    // Clear any active overlays/modals when route changes
    clearOverlays();
    
    // Use safe DOM operations as a fallback
    setTimeout(() => {
      cleanupOverlays();
    }, 50);
    
    // This effect runs on every navigation change
  }, [location.pathname, clearOverlays, cleanupOverlays]);
  
  return null;
};

export default NavigationLock;
