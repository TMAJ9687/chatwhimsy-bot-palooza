
import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

// This component helps prevent navigation issues by cleaning up any stale state
// or UI elements that might interfere with smooth transitions between pages
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const cleanupAttemptRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const cleanupTimeoutsRef = useRef<number[]>([]);
  const navigationInProgressRef = useRef(false);
  
  // Use our enhanced safe DOM operations hook
  const { cleanupOverlays } = useSafeDOMOperations();

  // Enhanced DOM cleanup utility with more robust error handling
  const cleanupUI = useCallback(() => {
    const now = Date.now();
    // Debounce cleanup attempts that happen too quickly
    if (cleanupAttemptRef.current || (now - lastCleanupTimeRef.current < 300)) return;
    
    cleanupAttemptRef.current = true;
    lastCleanupTimeRef.current = now;
    
    try {
      // Clear any stale timeouts
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Use our safe overlay cleanup
      cleanupOverlays();
      
      // Clear any navigation locks
      localStorage.removeItem('vipNavigationInProgress');
      navigationInProgressRef.current = false;
    } catch (error) {
      console.warn('Error during UI cleanup:', error);
    } finally {
      // Reset the cleanup attempt flag after a short delay
      const timeoutId = window.setTimeout(() => {
        cleanupAttemptRef.current = false;
      }, 500);
      cleanupTimeoutsRef.current.push(timeoutId);
    }
  }, [cleanupOverlays]);
  
  // Watch for route changes to clean up UI
  useEffect(() => {
    // Set navigation in progress
    navigationInProgressRef.current = true;
    
    // Clean up on route change
    cleanupUI();
    
    // For debugging navigation issues
    console.info(`Navigation to ${location.pathname} (${navigationType})`);
    
    // Clear any stuck profile navigation states when going to chat
    if (location.pathname === '/chat') {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
    // Mark navigation complete after a short delay
    const navigationCompleteTimeout = window.setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
    
    cleanupTimeoutsRef.current.push(navigationCompleteTimeout);
    
    return () => {
      // Clean up when component unmounts or before route change
      cleanupUI();
    };
  }, [location.pathname, navigationType, cleanupUI]);

  // Clean up on component mount and unmount
  useEffect(() => {
    // Initial cleanup
    cleanupUI();
    
    // Also clean up after a short delay to catch any late-emerging modals
    const delayedCleanup = window.setTimeout(() => {
      cleanupUI();
    }, 300);
    cleanupTimeoutsRef.current.push(delayedCleanup);
    
    return () => {
      // Clear all timeouts on component unmount
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Final cleanup when unmounting
      cleanupUI();
    };
  }, [cleanupUI]);

  // Listen for potential errors that might indicate DOM issues
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message && (
        error.message.includes('removeChild') || 
        error.message.includes('parentNode') || 
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
  }, [cleanupUI]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
