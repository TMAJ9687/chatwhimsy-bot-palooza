
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
    
    // This effect runs on every navigation change
  }, [location.pathname, clearOverlays]);
  
  return null;
};

export default NavigationLock;
