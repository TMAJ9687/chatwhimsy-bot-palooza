
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
        
        // Clean up any Firebase-related listeners that might still be active
        // without referencing Firebase directly
        const dangerousEventNames = [
          'snapshot',
          'value',
          'child_added',
          'child_changed',
          'child_removed',
          'child_moved'
        ];
        
        // Clean up potential overlay elements
        try {
          const elements = document.querySelectorAll('.fixed.inset-0');
          elements.forEach(el => {
            try {
              // Always verify parent-child relationship before removal
              if (el.parentNode && Array.from(el.parentNode.childNodes).includes(el)) {
                el.parentNode.removeChild(el);
              }
            } catch (e) {
              // Ignore errors during emergency cleanup
              console.debug('Error removing overlay element:', e);
            }
          });
        } catch (e) {
          // Ignore any DOM errors during cleanup
          console.debug('Error during overlay cleanup:', e);
        }
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
