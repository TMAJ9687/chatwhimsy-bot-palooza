
import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { performDOMCleanup } from '@/utils/errorHandler';

/**
 * This component helps prevent navigation issues by cleaning up any stale state
 * or UI elements that might interfere with smooth transitions between pages
 */
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Navigation state with refs to avoid dependencies
  const lastPathnameRef = React.useRef<string | null>(null);
  const isNavigatingRef = React.useRef(false);
  
  // Enhanced cleanup function that ensures all dialogs and overlays are removed
  const enhancedCleanup = useCallback(() => {
    // Clear overlays directly without context dependencies
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
  }, [location.pathname]);
  
  // Watch for route changes to clean up UI with improved timing
  useEffect(() => {
    // Skip if it's the first render (no navigation)
    if (!lastPathnameRef.current) {
      lastPathnameRef.current = location.pathname;
      return;
    }
    
    // Skip if it's the same location (prevents unnecessary cleanups)
    if (lastPathnameRef.current === location.pathname) {
      return;
    }
    
    // Set navigation in progress
    isNavigatingRef.current = true;
    lastPathnameRef.current = location.pathname;
    
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
      
      // Mark navigation complete after a delay
      const navigationCompleteTimeout = window.setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
      
      return () => {
        clearTimeout(secondCleanupId);
        clearTimeout(navigationCompleteTimeout);
      };
    });
    
    return () => {
      // Clean up when component unmounts or before route change
      enhancedCleanup();
    };
  }, [
    location.pathname, 
    navigationType, 
    enhancedCleanup
  ]);

  // Clean up on component mount and unmount
  useEffect(() => {
    // Initial cleanup
    enhancedCleanup();
    
    // Also clean up after a delay to catch any late-emerging modals
    const delayedCleanup = window.setTimeout(() => {
      enhancedCleanup();
    }, 300);
    
    return () => {
      clearTimeout(delayedCleanup);
      // Final cleanup when unmounting
      requestAnimationFrame(() => {
        enhancedCleanup();
      });
    };
  }, [enhancedCleanup]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
