import { useCallback, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { signOutUser } from '@/firebase/auth';
import { performDOMCleanup, cleanupDynamicImportArtifacts } from '@/utils/errorHandler';

/**
 * Hook that provides logout functionality with proper redirection
 * This hook should only be used within components that are descendants of UserProvider
 */
export const useLogout = () => {
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const isVip = user?.isVip || false;
  const logoutInProgressRef = useRef(false);
  const domFrozenRef = useRef(false);
  
  /**
   * Freezes React's DOM reconciliation to prevent removeChild errors
   * This ensures React won't try to manipulate nodes we're about to navigate away from
   */
  const freezeReactDOM = useCallback(() => {
    if (domFrozenRef.current) return;
    
    domFrozenRef.current = true;
    console.log('Freezing React DOM operations');
    
    try {
      // Apply a special data attribute to the root to signal freezing
      if (document.getElementById('root')) {
        document.getElementById('root')?.setAttribute('data-navigation', 'in-progress');
      }
      
      // Remove modal and dialog classes that might interfere with navigation
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Patch removeChild to be a no-op for nodes being navigated away from
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function(child) {
        // If we're navigating, don't throw errors for missing children
        if (domFrozenRef.current) {
          console.log('Intercepted removeChild during navigation');
          // Check if child is actually a child before removing
          if (this.contains(child)) {
            return originalRemoveChild.call(this, child);
          }
          // Return the child without throwing if not found during navigation
          return child;
        }
        // Otherwise use original behavior
        return originalRemoveChild.call(this, child);
      };
      
      // Restore the original after a short delay (after navigation should be complete)
      setTimeout(() => {
        if (domFrozenRef.current) {
          Node.prototype.removeChild = originalRemoveChild;
          domFrozenRef.current = false;
        }
      }, 1000);
    } catch (e) {
      console.warn('Error while freezing DOM:', e);
    }
  }, []);
  
  const performLogout = useCallback(async (callback?: () => void) => {
    // Prevent multiple logout attempts
    if (logoutInProgressRef.current) {
      console.log('Logout already in progress, skipping');
      return;
    }
    
    logoutInProgressRef.current = true;
    
    try {
      console.log('Starting logout process...');
      
      // Set logout event to trigger listeners and prevent automatic relogin
      localStorage.setItem('logoutEvent', Date.now().toString());
      
      // Execute in sequence with proper timing using microtasks
      await new Promise(resolve => {
        queueMicrotask(() => {
          // First clean up DOM state to prevent React errors
          performDOMCleanup();
          
          queueMicrotask(() => {
            // Also clean up any dynamic import artifacts
            cleanupDynamicImportArtifacts();
            
            queueMicrotask(() => {
              // Clean up storage systematically
              localStorage.removeItem('chatUser');
              localStorage.removeItem('vipProfileComplete');
              localStorage.removeItem('adminEmail');
              
              // Now freeze React DOM before navigation
              freezeReactDOM();
              resolve(null);
            });
          });
        });
      });
      
      // Force a hard reload immediately with clear navigation target
      // This bypasses React's DOM manipulation issues
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        try {
          await signOutUser();
          await adminLogout();
          clearUser();
          
          // Use location.replace for cleaner navigation without history
          window.location.replace('/secretadminportal');
        } catch (adminError) {
          console.error('Error in admin logout:', adminError);
          window.location.replace('/secretadminportal');
        }
      } else {
        console.log('Standard user logout flow initiated');
        // Clear user data first
        clearUser();
        
        // Run the callback if one was provided
        if (callback && typeof callback === 'function') {
          try {
            callback();
          } catch (error) {
            console.error('Error calling callback during logout', error);
          }
        }
        
        // Use force reload approach to completely reset app state
        const destination = isVip ? '/' : '/feedback';
        console.log(`Navigating to ${destination} with force reload`);
        
        // Use location.replace for cleaner navigation and append cache-busting parameter
        window.location.replace(`${destination}?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback logout - always navigate to home with forced reload
      try {
        clearUser();
        freezeReactDOM();
        
        console.log('Using fallback logout approach with force reload');
        window.location.href = '/?fallback=true';
        
        // Ensure page reloads if navigation doesn't happen immediately
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (e) {
        console.error('Fallback logout also failed', e);
        window.location.reload();
      } finally {
        logoutInProgressRef.current = false;
      }
    }
  }, [user, isVip, isAdmin, adminLogout, clearUser, freezeReactDOM]);

  return { performLogout };
};
