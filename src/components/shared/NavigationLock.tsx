
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// This component helps prevent navigation issues by cleaning up any stale state
// or UI elements that might interfere with smooth transitions between pages
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const cleanupAttemptRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);

  // Enhanced DOM cleanup utility with debouncing to avoid excessive cleanups
  const cleanupUI = () => {
    const now = Date.now();
    // Debounce cleanup attempts that happen too quickly
    if (cleanupAttemptRef.current || (now - lastCleanupTimeRef.current < 300)) return;
    
    cleanupAttemptRef.current = true;
    lastCleanupTimeRef.current = now;
    
    // Ensure body scroll is restored
    document.body.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden');
    
    // Remove any leftover modal backdrops with safer DOM manipulation
    const modals = document.querySelectorAll('.fixed.inset-0');
    modals.forEach(modal => {
      if (modal.parentNode) {
        try {
          modal.parentNode.removeChild(modal);
        } catch (error) {
          console.warn('Error removing modal:', error);
        }
      }
    });
    
    // Clear dialog-related classes from the body
    document.body.classList.remove('modal-open');
    
    // Remove any locks that might be active
    localStorage.removeItem('vipNavigationInProgress');
    
    // Reset the cleanup attempt flag after a short delay
    setTimeout(() => {
      cleanupAttemptRef.current = false;
    }, 500);
  };
  
  // Watch for route changes to clean up UI
  useEffect(() => {
    // Clean up on route change
    cleanupUI();
    
    // For debugging navigation issues
    console.log(`Navigation to ${location.pathname} (${navigationType})`);
    
    // Clear any stuck profile navigation states when going to chat
    if (location.pathname === '/chat') {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
    return () => {
      // Clean up when component unmounts
      cleanupUI();
    };
  }, [location.pathname, navigationType]);

  // Clean up on component mount and unmount
  useEffect(() => {
    cleanupUI();
    
    // Also clean up after a short delay to catch any late-emerging modals
    const delayedCleanup = setTimeout(() => {
      cleanupUI();
    }, 300);
    
    return () => {
      clearTimeout(delayedCleanup);
      cleanupUI();
    };
  }, []);

  // Listen for potential errors that might indicate DOM issues
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message && (
        error.message.includes('parentNode') || 
        error.message.includes('removeChild') ||
        error.message.includes('Cannot read properties of null')
      )) {
        console.warn('DOM error detected, running cleanup:', error.message);
        cleanupUI();
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
