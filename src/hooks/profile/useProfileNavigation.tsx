
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { domRegistry } from '@/services/dom';

export const useProfileNavigation = (
  isVip: boolean,
  isProfileComplete: boolean,
  mountedRef: React.RefObject<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavingDialog, setShowSavingDialog] = useState(false);
  const [navigationLock, setNavigationLock] = useState(false);
  
  const navigationAttemptRef = useRef(false);
  const saveOperationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupDOM = useCallback(() => {
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'modal-open', 'overflow-hidden');
    }
    
    domRegistry.cleanupOverlays();
    
    localStorage.removeItem('vipNavigationInProgress');
  }, []);

  const handleNavigation = useCallback((path: string) => {
    if (navigationLock || navigationAttemptRef.current || !mountedRef.current) {
      console.log('Navigation already in progress, ignoring request');
      return;
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
  }, [hasUnsavedChanges, isProfileComplete, cleanupDOM, mountedRef, navigate, navigationLock]);

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
