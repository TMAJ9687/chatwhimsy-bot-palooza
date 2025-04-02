
import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useUIState } from '@/context/UIStateContext';
import { useErrorCleaner } from '@/hooks/useErrorCleaner';

/**
 * This component helps prevent navigation issues by cleaning up any stale state
 * or UI elements that might interfere with smooth transitions between pages
 */
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { 
    clearOverlays, 
    startNavigation, 
    endNavigation,
    state: { navigation }
  } = useUIState();

  // Enhanced cleanup function that ensures all dialogs and overlays are removed
  const enhancedCleanup = useCallback(() => {
    clearOverlays();
    
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
  }, [clearOverlays, location.pathname]);
  
  // Register enhanced error handler
  useErrorCleaner(enhancedCleanup);
  
  // Watch for route changes to clean up UI with improved timing
  useEffect(() => {
    // Skip if it's the first render (no navigation)
    if (!navigation.lastPathname) {
      startNavigation(location.pathname);
      return;
    }
    
    // Skip if it's the same location (prevents unnecessary cleanups)
    if (navigation.lastPathname === location.pathname) {
      return;
    }
    
    // Set navigation in progress
    startNavigation(location.pathname);
    
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
        endNavigation();
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
    enhancedCleanup, 
    navigation.lastPathname,
    startNavigation,
    endNavigation
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
