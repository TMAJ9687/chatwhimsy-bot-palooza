
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VipProfileFormRef } from '@/components/profile/VipProfileForm';
import { performDOMCleanup } from '@/utils/errorHandler';

export const useProfileSaving = (
  profileFormRef: React.RefObject<VipProfileFormRef>,
  pendingNavigation: string | null,
  mountedRef: React.RefObject<boolean>,
  navigationAttemptRef: React.MutableRefObject<boolean>,
  saveOperationTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  setPendingNavigation: React.Dispatch<React.SetStateAction<string | null>>,
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>,
  setShowUnsavedDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setShowSavingDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setNavigationLock: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>,
  cleanupDOM: () => void
) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveAndNavigate = useCallback(async () => {
    if (navigationAttemptRef.current || !mountedRef.current) {
      console.log('Save operation already in progress, ignoring request');
      return;
    }
    
    setNavigationLock(true);
    navigationAttemptRef.current = true;
    setIsSaving(true);
    setShowSavingDialog(true);
    
    try {
      let saved = false;
      
      if (profileFormRef.current) {
        saved = await profileFormRef.current.saveForm();
      } else {
        saved = true;
      }
      
      if (saved) {
        localStorage.setItem('vipProfileComplete', 'true');
        setHasUnsavedChanges(false);
        
        await new Promise<void>(resolve => {
          saveOperationTimeoutRef.current = setTimeout(() => {
            if (!mountedRef.current) {
              resolve();
              return;
            }
            
            // Close dialogs first, then do DOM cleanup
            setShowSavingDialog(false);
            setShowUnsavedDialog(false);
            
            // Add a small delay before navigation to let React clean up dialogs
            setTimeout(() => {
              if (!mountedRef.current) {
                resolve();
                return;
              }
              
              if (pendingNavigation) {
                const destination = pendingNavigation;
                setPendingNavigation(null);
                
                // Do DOM cleanup right before navigation
                performDOMCleanup();
                cleanupDOM();
                
                // Use a promise-based approach for more reliable navigation
                const safeNavigate = () => {
                  try {
                    console.log(`Navigating to ${destination}`);
                    navigate(destination);
                    
                    setTimeout(() => {
                      if (!mountedRef.current) return;
                      setNavigationLock(false);
                      navigationAttemptRef.current = false;
                      setIsSaving(false);
                    }, 300);
                  } catch (navError) {
                    console.error("Navigation error:", navError);
                    // Force location change as fallback
                    window.location.href = destination;
                  } finally {
                    resolve();
                  }
                };
                
                // Schedule navigation in next tick
                setTimeout(safeNavigate, 50);
              } else {
                setNavigationLock(false);
                navigationAttemptRef.current = false;
                setIsSaving(false);
                resolve();
              }
            }, 100);
          }, 500);
        });
      } else {
        toast({
          title: "Error",
          description: "Please fix the form errors before continuing.",
          variant: "destructive",
        });
        setShowSavingDialog(false);
        setNavigationLock(false);
        navigationAttemptRef.current = false;
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error during save and navigate:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setShowSavingDialog(false);
      setNavigationLock(false);
      navigationAttemptRef.current = false;
      setIsSaving(false);
    }
  }, [
    cleanupDOM, 
    mountedRef, 
    navigate, 
    navigationAttemptRef, 
    pendingNavigation, 
    profileFormRef, 
    saveOperationTimeoutRef,
    setHasUnsavedChanges, 
    setIsSaving, 
    setNavigationLock, 
    setPendingNavigation, 
    setShowSavingDialog, 
    setShowUnsavedDialog, 
    toast
  ]);

  const handleDiscardAndNavigate = useCallback(() => {
    if (!mountedRef.current) return;
    
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    
    if (pendingNavigation) {
      const destination = pendingNavigation;
      setPendingNavigation(null);
      
      setNavigationLock(true);
      navigationAttemptRef.current = true;
      
      cleanupDOM();
      
      setTimeout(() => {
        if (!mountedRef.current) return;
        
        navigate(destination);
        
        setTimeout(() => {
          if (!mountedRef.current) return;
          
          setNavigationLock(false);
          navigationAttemptRef.current = false;
        }, 300);
      }, 50);
    }
  }, [
    cleanupDOM, 
    mountedRef, 
    navigate, 
    navigationAttemptRef, 
    pendingNavigation, 
    setHasUnsavedChanges, 
    setNavigationLock, 
    setPendingNavigation, 
    setShowUnsavedDialog
  ]);

  return {
    handleSaveAndNavigate,
    handleDiscardAndNavigate
  };
};
