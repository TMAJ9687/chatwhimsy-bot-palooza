
import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useNavigationCleanup } from '@/hooks/useNavigationCleanup';
import { useErrorCleaner } from '@/hooks/useErrorCleaner';

/**
 * This component helps prevent navigation issues by cleaning up any stale state
 * or UI elements that might interfere with smooth transitions between pages
 */
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { cleanupUI, cleanupTimeoutsRef, navigationInProgressRef } = useNavigationCleanup();
  
  // Register error handler to catch and clean up DOM errors
  useErrorCleaner(cleanupUI);
  
  // Watch for route changes to clean up UI with improved timing
  useEffect(() => {
    // Set navigation in progress
    navigationInProgressRef.current = true;
    
    // Use requestAnimationFrame for smoother cleanup timing
    requestAnimationFrame(() => {
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
  }, [location.pathname, navigationType, cleanupUI, cleanupTimeoutsRef, navigationInProgressRef]);

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
      // Final cleanup when unmounting
      requestAnimationFrame(() => {
        cleanupUI();
      });
    };
  }, [cleanupUI, cleanupTimeoutsRef]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
