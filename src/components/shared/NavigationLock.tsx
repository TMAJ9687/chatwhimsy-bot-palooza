
import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// This component helps prevent navigation issues by cleaning up any stale state
// or UI elements that might interfere with smooth transitions between pages
const NavigationLock: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const cleanupAttemptRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const cleanupTimeoutsRef = useRef<number[]>([]);

  // Enhanced DOM cleanup utility with more robust error handling and element checks
  const cleanupUI = useCallback(() => {
    const now = Date.now();
    // Debounce cleanup attempts that happen too quickly
    if (cleanupAttemptRef.current || (now - lastCleanupTimeRef.current < 300)) return;
    
    cleanupAttemptRef.current = true;
    lastCleanupTimeRef.current = now;
    
    try {
      // Ensure body scroll is restored
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Clear any stale timeouts
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Capture all overlay types to ensure comprehensive cleanup
      const overlaySelectors = [
        // Modal/dialog overlays
        '.fixed.inset-0.z-50',
        '.fixed.inset-0.bg-black\\/80',
        // Radix UI specific overlays
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        // Vaul drawer overlays
        '.vaul-overlay',
        // Any other potential overlays
        '.backdrop',
        '.modal-backdrop'
      ];
      
      // Use requestAnimationFrame to ensure DOM is stable before manipulation
      requestAnimationFrame(() => {
        // First safely collect all overlays without modifying DOM
        const overlaysToRemove: Element[] = [];
        
        overlaySelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(overlay => {
            // Only add to removal list if it has a parent and is a child of that parent
            if (overlay && overlay.parentNode && overlay.parentNode.contains(overlay)) {
              overlaysToRemove.push(overlay);
            }
          });
        });
        
        // Then safely remove each overlay with additional checks
        overlaysToRemove.forEach(overlay => {
          try {
            // Double-check parent relationship right before removal
            if (overlay.parentNode && overlay.parentNode.contains(overlay)) {
              overlay.parentNode.removeChild(overlay);
            }
          } catch (error) {
            console.warn('Error safely removing overlay:', error);
          }
        });
      });
      
      // Clear any navigation locks
      localStorage.removeItem('vipNavigationInProgress');
    } catch (error) {
      console.warn('Error during UI cleanup:', error);
    } finally {
      // Reset the cleanup attempt flag after a short delay
      const timeoutId = window.setTimeout(() => {
        cleanupAttemptRef.current = false;
      }, 500);
      cleanupTimeoutsRef.current.push(timeoutId);
    }
  }, []);
  
  // Watch for route changes to clean up UI
  useEffect(() => {
    // Clean up on route change
    cleanupUI();
    
    // For debugging navigation issues
    console.info(`Navigation to ${location.pathname} (${navigationType})`);
    
    // Clear any stuck profile navigation states when going to chat
    if (location.pathname === '/chat') {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
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
  }, [cleanupUI]);

  // This is a utility component - it doesn't render anything
  return null;
};

export default NavigationLock;
