
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VipProfileFormRef } from '@/components/profile/VipProfileForm';
import { performDOMCleanup } from '@/utils/errorHandler';
import { unstable_batchedUpdates } from 'react-dom';

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

  // Safe state update helper function
  const safeUpdateState = useCallback((callback: () => void) => {
    if (mountedRef.current) {
      unstable_batchedUpdates(callback);
    }
  }, [mountedRef]);

  // Improved save and navigate function with better error handling and state management
  const handleSaveAndNavigate = useCallback(async () => {
    // Prevent multiple save attempts
    if (navigationAttemptRef.current || !mountedRef.current) {
      console.log('Save operation already in progress, ignoring request');
      return;
    }
    
    // Lock navigation and set saving state
    safeUpdateState(() => {
      setNavigationLock(true);
      navigationAttemptRef.current = true;
      setIsSaving(true);
      setShowSavingDialog(true);
    });
    
    try {
      let saved = false;
      
      // Try to save the form if the ref exists
      if (profileFormRef.current) {
        saved = await profileFormRef.current.saveForm();
      } else {
        // No form to save, so consider it successful
        saved = true;
      }
      
      if (saved) {
        // Mark profile as complete in localStorage
        localStorage.setItem('vipProfileComplete', 'true');
        
        // Update unsaved changes state
        if (mountedRef.current) {
          safeUpdateState(() => {
            setHasUnsavedChanges(false);
          });
        }
        
        // Wait for UI to update and then proceed with navigation
        await new Promise<void>(resolve => {
          saveOperationTimeoutRef.current = setTimeout(() => {
            // Skip further processing if component unmounted
            if (!mountedRef.current) {
              resolve();
              return;
            }
            
            // Close dialogs first using batched updates
            safeUpdateState(() => {
              setShowSavingDialog(false);
              setShowUnsavedDialog(false);
            });
            
            // Add a delay before navigation to let React clean up dialogs
            setTimeout(() => {
              // Skip if component unmounted during timeout
              if (!mountedRef.current) {
                resolve();
                return;
              }
              
              // If we have a pending navigation destination
              if (pendingNavigation) {
                const destination = pendingNavigation;
                
                // Clear pending navigation state and update flags
                safeUpdateState(() => {
                  setPendingNavigation(null);
                  navigationAttemptRef.current = true;
                  setNavigationLock(true);
                });
                
                // Pre-mark complete in localStorage before navigation
                localStorage.setItem('vipProfileComplete', 'true');
                
                // Use queueMicrotask to ensure React has finished its rendering cycle
                queueMicrotask(() => {
                  // Perform navigation with React Router
                  try {
                    console.log(`Navigating to ${destination}`);
                    navigate(destination);
                    
                    // Reset states after navigation with a delay
                    setTimeout(() => {
                      if (mountedRef.current) {
                        safeUpdateState(() => {
                          setNavigationLock(false);
                          navigationAttemptRef.current = false;
                          setIsSaving(false);
                        });
                      }
                      resolve();
                    }, 300);
                  } catch (navError) {
                    console.error("Navigation error:", navError);
                    
                    // Force location change as fallback
                    window.location.href = destination;
                    resolve();
                  }
                });
              } else {
                // No navigation needed, just reset states
                if (mountedRef.current) {
                  safeUpdateState(() => {
                    setNavigationLock(false);
                    navigationAttemptRef.current = false;
                    setIsSaving(false);
                  });
                }
                resolve();
              }
            }, 100);
          }, 500);
        });
      } else {
        // Form validation failed
        if (mountedRef.current) {
          toast({
            title: "Error",
            description: "Please fix the form errors before continuing.",
            variant: "destructive",
          });
          
          safeUpdateState(() => {
            setShowSavingDialog(false);
            setNavigationLock(false);
            navigationAttemptRef.current = false;
            setIsSaving(false);
          });
        }
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error during save and navigate:", error);
      
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        
        safeUpdateState(() => {
          setShowSavingDialog(false);
          setNavigationLock(false);
          navigationAttemptRef.current = false;
          setIsSaving(false);
        });
      }
    }
  }, [
    cleanupDOM, 
    mountedRef, 
    navigate, 
    navigationAttemptRef, 
    pendingNavigation, 
    profileFormRef, 
    safeUpdateState,
    saveOperationTimeoutRef,
    setHasUnsavedChanges, 
    setIsSaving, 
    setNavigationLock, 
    setPendingNavigation, 
    setShowSavingDialog, 
    setShowUnsavedDialog, 
    toast
  ]);

  // Enhanced discard and navigate function with better state management
  const handleDiscardAndNavigate = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Update states using batched updates
    safeUpdateState(() => {
      setHasUnsavedChanges(false);
      setShowUnsavedDialog(false);
    });
    
    // Process navigation if we have a destination
    if (pendingNavigation) {
      const destination = pendingNavigation;
      
      safeUpdateState(() => {
        setPendingNavigation(null);
        setNavigationLock(true);
        navigationAttemptRef.current = true;
      });
      
      // Pre-mark complete in localStorage before navigation
      localStorage.setItem('vipProfileComplete', 'true');
      
      // Use queueMicrotask to ensure React has finished its rendering cycle
      queueMicrotask(() => {
        try {
          console.log(`Navigating to ${destination}`);
          navigate(destination);
          
          // Reset navigation states after a delay
          setTimeout(() => {
            if (mountedRef.current) {
              safeUpdateState(() => {
                setNavigationLock(false);
                navigationAttemptRef.current = false;
              });
            }
          }, 300);
        } catch (navError) {
          console.error("Navigation error:", navError);
          window.location.href = destination;
        }
      });
    }
  }, [
    mountedRef, 
    navigate, 
    navigationAttemptRef, 
    pendingNavigation, 
    safeUpdateState,
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
