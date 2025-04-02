
import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useNavigationCleanup } from '@/hooks/useNavigationCleanup';
import { useErrorCleaner } from '@/hooks/useErrorCleaner';
import { performDOMCleanup } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';

/**
 * This component helps prevent navigation issues by cleaning up any stale state
 * or UI elements that might interfere with smooth transitions between pages
 */
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { cleanupUI, cleanupTimeoutsRef, navigationInProgressRef } = useNavigationCleanup();
  const cleanupCountRef = useRef(0);
  const lastLocationRef = useRef(location.pathname);

  // Enhanced cleanup function that ensures all dialogs and overlays are removed
  const enhancedCleanup = useCallback(() => {
    cleanupUI();
    cleanupCountRef.current++;
    
    // Perform advanced DOM cleanup
    performDOMCleanup();
    
    // Add specific cleanup for chat navigation
    if (location.pathname === '/chat') {
      try {
        // Ensure chatUser has isVip explicitly set
        const savedUserData = localStorage.getItem('chatUser');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          if (userData.isVip === undefined) {
            userData.isVip = false;
            localStorage.setItem('chatUser', JSON.stringify(userData));
            console.log('Fixed chatUser in localStorage, explicitly set isVip=false');
          }
        }
      } catch (e) {
        console.warn('Error checking/fixing user data:', e);
      }
    }
  }, [cleanupUI, location.pathname]);
  
  // Register enhanced error handler
  useErrorCleaner(enhancedCleanup);
  
  // Watch for route changes to clean up UI with improved timing
  useEffect(() => {
    // Skip if it's the same location (prevents unnecessary cleanups)
    if (lastLocationRef.current === location.pathname) {
      return;
    }
    
    // Update last location
    lastLocationRef.current = location.pathname;
    
    // Set navigation in progress
    navigationInProgressRef.current = true;
    
    // Use requestAnimationFrame for smoother cleanup timing
    requestAnimationFrame(() => {
      // First cleanup round
      enhancedCleanup();
      
      // For debugging navigation issues
      console.info(`Navigation to ${location.pathname} (${navigationType})`);
      
      // Clear any stuck profile navigation states when going to chat
      if (location.pathname === '/chat') {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Secondary cleanup with delay for elements that might appear after initial cleanup
      const secondCleanupId = window.setTimeout(() => {
        enhancedCleanup();
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
      enhancedCleanup();
    };
  }, [location.pathname, navigationType, enhancedCleanup, cleanupTimeoutsRef, navigationInProgressRef]);

  // Clean up on component mount and unmount
  useEffect(() => {
    // Initial cleanup
    enhancedCleanup();
    
    // Also clean up after a delay to catch any late-emerging modals
    const delayedCleanup = window.setTimeout(() => {
      enhancedCleanup();
    }, 300);
    cleanupTimeoutsRef.current.push(delayedCleanup);
    
    // Setup global error handler for removeChild errors
    const handleDOMError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('removeChild') && 
          event.message.includes('not a child')) {
        // Prevent the error from propagating
        event.preventDefault();
        event.stopPropagation();
        console.warn('Caught removeChild error, suppressing and cleaning up');
        
        // Run enhanced cleanup
        enhancedCleanup();
        
        return false;
      }
    };
    
    window.addEventListener('error', handleDOMError, true);
    
    return () => {
      // Final cleanup when unmounting
      window.removeEventListener('error', handleDOMError, true);
      requestAnimationFrame(() => {
        enhancedCleanup();
      });
    };
  }, [enhancedCleanup, cleanupTimeoutsRef]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
