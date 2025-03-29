
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VipProfileFormRef } from '@/components/profile/VipProfileForm';

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
            
            setShowSavingDialog(false);
            setShowUnsavedDialog(false);
            
            if (pendingNavigation) {
              const destination = pendingNavigation;
              setPendingNavigation(null);
              
              cleanupDOM();
              
              setTimeout(() => {
                if (!mountedRef.current) {
                  resolve();
                  return;
                }
                
                navigate(destination);
                
                setTimeout(() => {
                  if (!mountedRef.current) {
                    resolve();
                    return;
                  }
                  
                  setNavigationLock(false);
                  navigationAttemptRef.current = false;
                  setIsSaving(false);
                  resolve();
                }, 300);
              }, 50);
            } else {
              setNavigationLock(false);
              navigationAttemptRef.current = false;
              setIsSaving(false);
              resolve();
            }
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
