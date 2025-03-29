
import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigationType, useNavigate } from 'react-router-dom';
import { useNavigationCleanup } from '@/hooks/useNavigationCleanup';
import { useErrorCleaner } from '@/hooks/useErrorCleaner';
import { toast } from '@/hooks/use-toast'; 

/**
 * This component helps prevent navigation issues by cleaning up any stale state
 * or UI elements that might interfere with smooth transitions between pages
 */
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { cleanupUI, cleanupTimeoutsRef, navigationInProgressRef } = useNavigationCleanup();
  const cleanupCountRef = useRef(0);
  const lastLocationRef = useRef(location.pathname);
  const firestoreErrorShownRef = useRef(false);
  const vipNavRetryCountRef = useRef(0);
  const vipNavTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced cleanup function that ensures all dialogs and overlays are removed
  const enhancedCleanup = useCallback(() => {
    cleanupUI();
    cleanupCountRef.current++;
    
    // Perform additional cleanup for problematic elements
    try {
      // Reset body state
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Remove any potentially problematic portal elements
      const portalSelectors = [
        '[role="dialog"]', 
        '[aria-modal="true"]',
        '.fixed.inset-0',
        '[data-radix-portal]',
        '.radix-portal'
      ];
      
      portalSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            try {
              if (el.parentNode) {
                // Verify it's actually a child before removal
                const parent = el.parentNode;
                const isChild = Array.from(parent.childNodes).includes(el);
                
                if (isChild) {
                  // First try the modern remove() method
                  try {
                    el.remove();
                  } catch (e) {
                    // Fallback to removeChild
                    if (parent.contains(el)) {
                      parent.removeChild(el as ChildNode);
                    }
                  }
                }
              }
            } catch (e) {
              // Ignore individual element cleanup errors
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
    } catch (e) {
      console.warn('Error during enhanced cleanup:', e);
    }
    
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
          
          // When Firestore has issues, make sure we let the user know
          if (location.pathname === '/chat' && userData.isVip && !firestoreErrorShownRef.current) {
            // Check if we've had Firestore errors
            const firestoreErrors = sessionStorage.getItem('firestoreErrors');
            const firestoreBlocked = sessionStorage.getItem('firestoreBlocked') === 'true';
            
            if ((firestoreErrors && parseInt(firestoreErrors) > 0) || firestoreBlocked) {
              firestoreErrorShownRef.current = true;
              toast({
                title: "You're working offline",
                description: "Profile changes will be saved locally. Check if ad blockers are enabled.",
                variant: "default"
              });
            }
          }
        }
      } catch (e) {
        console.warn('Error checking/fixing user data:', e);
      }
    }
  }, [cleanupUI, location.pathname]);
  
  // Register enhanced error handler
  useErrorCleaner(enhancedCleanup);
  
  // Handle VIP profile navigation issues
  useEffect(() => {
    if (location.pathname === '/vip-profile') {
      // Clear any stuck VIP navigation flags
      localStorage.removeItem('vipNavigationInProgress');
      
      // Setup force navigation to chat if we get stuck
      if (vipNavTimeoutRef.current) {
        clearTimeout(vipNavTimeoutRef.current);
      }
      
      vipNavTimeoutRef.current = setTimeout(() => {
        // Check if we have a valid profile
        try {
          const savedUserData = localStorage.getItem('chatUser');
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            
            // If user has all required fields, force completion
            if (userData.gender && userData.age && userData.country && userData.isVip) {
              console.log('VIP profile appears complete, marking as complete and enabling navigation');
              localStorage.setItem('vipProfileComplete', 'true');
              
              // Only force navigate after multiple attempts
              vipNavRetryCountRef.current++;
              
              if (vipNavRetryCountRef.current >= 2) {
                toast({
                  title: "Profile Ready",
                  description: "You can now access the chat",
                  variant: "default"
                });
                
                // Force navigation to chat after cleanup
                enhancedCleanup();
                setTimeout(() => navigate('/chat'), 500);
              }
            }
          }
        } catch (e) {
          console.warn('Error checking VIP profile data:', e);
        }
      }, 5000);
      
      return () => {
        if (vipNavTimeoutRef.current) {
          clearTimeout(vipNavTimeoutRef.current);
        }
      };
    }
  }, [location.pathname, navigate, enhancedCleanup]);
  
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
