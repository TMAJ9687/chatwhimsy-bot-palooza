
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { domRegistry } from '@/services/dom';
import { useUser } from '@/context/UserContext';
import { saveVipUserProfile } from '@/firebase/firestore';

export const useProfileNavigation = (
  isVip: boolean,
  isProfileComplete: boolean,
  mountedRef: React.RefObject<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser(); // Get current user
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavingDialog, setShowSavingDialog] = useState(false);
  const [navigationLock, setNavigationLock] = useState(false);
  
  const navigationAttemptRef = useRef(false);
  const saveOperationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firestoreSaveAttemptedRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure profile exists in Firestore before navigation
  const ensureProfileInFirestore = useCallback(async () => {
    if (user && user.isVip && !firestoreSaveAttemptedRef.current) {
      firestoreSaveAttemptedRef.current = true;
      try {
        await saveVipUserProfile(user);
        console.log('Successfully ensured VIP profile exists in Firestore');
        return true;
      } catch (error) {
        console.error('Failed to ensure VIP profile in Firestore:', error);
        // Continue with navigation even if Firestore save fails
        return true;
      }
    }
    return true;
  }, [user]);

  const cleanupDOM = useCallback(() => {
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'modal-open', 'overflow-hidden');
    }
    
    domRegistry.cleanupOverlays();
    
    // Clear any potential stuck navigation flags
    localStorage.removeItem('vipNavigationInProgress');
    
    // Extra cleanup for any stuck dialog elements
    try {
      const dialogElements = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], .fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]'
      );
      
      if (dialogElements.length > 0) {
        console.log(`Cleaning up ${dialogElements.length} dialog elements`);
        dialogElements.forEach(el => {
          try {
            if (el.parentNode) {
              el.remove();
            }
          } catch (err) {
            console.warn('Error removing dialog element:', err);
          }
        });
      }
    } catch (err) {
      console.warn('Error during extra DOM cleanup:', err);
    }
  }, []);

  const handleNavigation = useCallback(async (path: string) => {
    if (navigationLock || navigationAttemptRef.current || !mountedRef.current) {
      console.log('Navigation already in progress, ignoring request');
      return;
    }
    
    console.log(`Initiating navigation to ${path}`);
    
    // Set a timeout to force navigation if it gets stuck
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    navigationTimeoutRef.current = setTimeout(() => {
      console.log('Navigation timeout reached, forcing navigation');
      cleanupDOM();
      
      // Mark profile as complete to avoid redirect loops
      if (isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Force navigation with browser API if React navigation is stuck
      window.location.href = path;
    }, 3000);
    
    // Ensure VIP user is in Firestore before navigation
    if (isVip) {
      await ensureProfileInFirestore();
    }
    
    // Validate that the user has a complete profile before VIP navigation
    if (path === '/chat' && isVip) {
      // Check if user has all required fields
      if (!user?.id || !user?.nickname || !user?.email) {
        toast({
          title: "Profile Incomplete",
          description: "Please ensure your profile information is complete before continuing.",
          variant: "destructive",
        });
        
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
          navigationTimeoutRef.current = null;
        }
        return;
      }
      
      // Explicitly mark the profile as complete in localStorage to avoid inconsistencies
      localStorage.setItem('vipProfileComplete', 'true');
      console.log('Setting vipProfileComplete to true in localStorage');
    }
    
    // We're always treating Go to Chat as a "save and navigate" operation
    if (path === '/chat') {
      // Set pending navigation to be used by the save operation
      setPendingNavigation(path);
      setShowSavingDialog(true);
      setNavigationLock(true);
      return;
    }
    
    // For any other navigation
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      setNavigationLock(true);
      navigationAttemptRef.current = true;
      
      if (isProfileComplete) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      cleanupDOM();
      
      setTimeout(() => {
        if (!mountedRef.current) return;
        
        try {
          navigate(path);
          console.log(`Navigation to ${path} executed`);
        } catch (err) {
          console.error('Error during navigation, using fallback:', err);
          window.location.href = path;
        }
        
        setTimeout(() => {
          if (!mountedRef.current) return;
          
          setNavigationLock(false);
          navigationAttemptRef.current = false;
          
          // Clear the navigation timeout
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
          }
        }, 300);
      }, 50);
    }
  }, [
    hasUnsavedChanges, 
    isProfileComplete, 
    cleanupDOM, 
    mountedRef, 
    navigate, 
    navigationLock, 
    isVip, 
    user, 
    toast, 
    ensureProfileInFirestore
  ]);

  const handleGoToChat = useCallback(() => {
    handleNavigation('/chat');
  }, [handleNavigation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      if (saveOperationTimeoutRef.current) {
        clearTimeout(saveOperationTimeoutRef.current);
        saveOperationTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    hasUnsavedChanges,
    showUnsavedDialog,
    pendingNavigation,
    isSaving,
    showSavingDialog,
    navigationLock,
    navigationAttemptRef,
    saveOperationTimeoutRef,
    cleanupDOM,
    handleNavigation,
    handleGoToChat,
    setHasUnsavedChanges,
    setShowUnsavedDialog,
    setPendingNavigation,
    setIsSaving,
    setShowSavingDialog,
    setNavigationLock
  };
};
