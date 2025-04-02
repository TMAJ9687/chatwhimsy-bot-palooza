
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';

const NavigationLock: React.FC = () => {
  const location = useLocation();
  let clearOverlays = () => {};
  
  try {
    // Try to get the UIState context, but don't crash if it's not available
    const uiState = useUIState();
    clearOverlays = uiState.clearOverlays;
  } catch (error) {
    console.error('UIStateContext not available:', error);
    // Provide fallback functionality if needed
  }
  
  // Clean up UI state on navigation
  useEffect(() => {
    // Clear any active overlays/modals when route changes
    try {
      clearOverlays();
    } catch (error) {
      console.error('Failed to clear overlays:', error);
    }
    
    // This effect runs on every navigation change
  }, [location.pathname, clearOverlays]);
  
  return null;
};

export default NavigationLock;
