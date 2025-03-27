
import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';
import { domRegistry } from '@/services/DOMRegistry';

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
  const { cleanupOverlays, isDOMReady } = useSafeDOMOperations();

  // Enhanced DOM cleanup utility with debouncing and safeguards
  const cleanupUI = useCallback(() => {
    if (!isDOMReady()) return;
    
    const now = Date.now();
    // Debounce cleanup attempts that happen too quickly
    if (cleanupAttemptRef.current || (now - lastCleanupTimeRef.current < 200)) return;
    
    cleanupAttemptRef.current = true;
    lastCleanupTimeRef.current = now;
    
    try {
      // Clear any stale timeouts
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Reset body scroll
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Use our safe overlay cleanup after a short delay
      const timeoutId = window.setTimeout(() => {
        domRegistry.cleanupOverlays();
      }, 50);
      
      cleanupTimeoutsRef.current.push(timeoutId);
      
      // Clear any navigation locks
      localStorage.removeItem('vipNavigationInProgress');
      navigationInProgressRef.current = false;
    } catch (error) {
      console.warn('Error during UI cleanup:', error);
    } finally {
      // Reset the cleanup attempt flag after a short delay
      const timeoutId = window.setTimeout(() => {
        cleanupAttemptRef.current = false;
      }, 300);
      cleanupTimeoutsRef.current.push(timeoutId);
    }
  }, [cleanupOverlays, isDOMReady]);
  
  // Watch for route changes to clean up UI with improved timing
  useEffect(() => {
    // Set navigation in progress
    navigationInProgressRef.current = true;
    
    // Throttle cleanup to avoid race conditions
    queueMicrotask(() => {
      // First cleanup round
      cleanupUI();
      
      // For debugging navigation issues
      console.info(`Navigation to ${location.pathname} (${navigationType})`);
      
      // Clear any stuck profile navigation states when going to chat
      if (location.pathname === '/chat') {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Secondary cleanup with delay for elements that might appear after initial cleanup
      const secondCleanupId = window.setTimeout(() => {
        cleanupUI();
      }, 300);
      
      cleanupTimeoutsRef.current.push(secondCleanupId);
      
      // Mark navigation complete after a delay
      const navigationCompleteTimeout = window.setTimeout(() => {
        navigationInProgressRef.current = false;
      }, 500);
      
      cleanupTimeoutsRef.current.push(navigationCompleteTimeout);
    });
    
    return () => {
      // Clean up when component unmounts or before route change
      cleanupUI();
    };
  }, [location.pathname, navigationType, cleanupUI]);

  // Clean up on component mount and unmount
  useEffect(() => {
    // Initial cleanup
    cleanupUI();
    
    // Also clean up after a delay to catch any late-emerging modals
    const delayedCleanup = window.setTimeout(() => {
      cleanupUI();
    }, 300);
    cleanupTimeoutsRef.current.push(delayedCleanup);
    
    return () => {
      // Clear all timeouts on component unmount
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Final cleanup when unmounting
      queueMicrotask(() => {
        cleanupUI();
      });
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
        
        // Use setTimeout to avoid potential event loop congestion
        setTimeout(() => {
          cleanupUI();
        }, 0);
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
