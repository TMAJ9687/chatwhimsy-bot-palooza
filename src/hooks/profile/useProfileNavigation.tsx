
import { useState, useRef, useCallback } from 'react';
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
  
  // Ensure profile exists in Firestore before navigation
  const ensureProfileInFirestore = useCallback(async () => {
    if (user && user.isVip && !firestoreSaveAttemptedRef.current) {
      firestoreSaveAttemptedRef.current = true;
      try {
        await saveVipUserProfile(user);
        console.log('Successfully ensured VIP profile exists in Firestore');
      } catch (error) {
        console.error('Failed to ensure VIP profile in Firestore:', error);
      }
    }
  }, [user]);

  const cleanupDOM = useCallback(() => {
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'modal-open', 'overflow-hidden');
    }
    
    domRegistry.cleanupOverlays();
    
    localStorage.removeItem('vipNavigationInProgress');
  }, []);

  const handleNavigation = useCallback(async (path: string) => {
    if (navigationLock || navigationAttemptRef.current || !mountedRef.current) {
      console.log('Navigation already in progress, ignoring request');
      return;
    }
    
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
        return;
      }
      
      // Explicitly mark the profile as complete in localStorage to avoid inconsistencies
      localStorage.setItem('vipProfileComplete', 'true');
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
        
        navigate(path);
        
        setTimeout(() => {
          if (!mountedRef.current) return;
          
          setNavigationLock(false);
          navigationAttemptRef.current = false;
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
