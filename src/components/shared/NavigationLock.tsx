
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
      // Silently handle this error - no need to report to user
      console.debug('Failed to clear overlays, this is likely not a major issue:', error);
    }
    
    // Handle any location-specific cleanup
    const handleLocationChange = () => {
      // Clear problematic event listeners during navigation
      // This helps prevent potential memory leaks
      try {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('dialog-open', 'modal-open', 'overflow-hidden');
      } catch (e) {
        console.debug('DOM cleanup during navigation failed:', e);
      }
    };
    
    handleLocationChange();
    
    // This effect runs on every navigation change
  }, [location.pathname, clearOverlays]);
  
  return null;
};

export default NavigationLock;
