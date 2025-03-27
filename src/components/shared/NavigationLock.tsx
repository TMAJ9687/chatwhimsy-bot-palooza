
import React, { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// This component helps prevent navigation issues by cleaning up any stale state
// or UI elements that might interfere with smooth transitions between pages
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Function to clean up modal artifacts when navigating
    const cleanupUI = () => {
      // Ensure body scroll is restored
      document.body.style.overflow = 'auto';
      
      // Remove any leftover modal backdrops
      const modals = document.querySelectorAll('.fixed.inset-0');
      modals.forEach(modal => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      });
      
      // Remove any locks that might be active
      localStorage.removeItem('vipNavigationInProgress');
    };
    
    // Clean up on route change
    cleanupUI();
    
    // For debugging navigation issues
    console.log(`Navigation to ${location.pathname} (${navigationType})`);
    
    return () => {
      // Clean up when component unmounts
      cleanupUI();
    };
  }, [location.pathname, navigationType]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
