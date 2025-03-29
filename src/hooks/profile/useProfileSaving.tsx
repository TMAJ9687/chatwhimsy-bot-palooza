
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

  // Improved save and navigate function with better error handling and state management
  const handleSaveAndNavigate = useCallback(async () => {
    // Prevent multiple save attempts
    if (navigationAttemptRef.current || !mountedRef.current) {
      console.log('Save operation already in progress, ignoring request');
      return;
    }
    
    // Lock navigation and set saving state
    setNavigationLock(true);
    navigationAttemptRef.current = true;
    setIsSaving(true);
    
    // Show saving dialog
    if (mountedRef.current) {
      setShowSavingDialog(true);
    }
    
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
          setHasUnsavedChanges(false);
        }
        
        // Wait for UI to update and then proceed with navigation
        await new Promise<void>(resolve => {
          saveOperationTimeoutRef.current = setTimeout(() => {
            // Skip further processing if component unmounted
            if (!mountedRef.current) {
              resolve();
              return;
            }
            
            // Close dialogs first, then do DOM cleanup
            setShowSavingDialog(false);
            setShowUnsavedDialog(false);
            
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
                
                // Clear pending navigation state
                if (mountedRef.current) {
                  setPendingNavigation(null);
                }
                
                // First, update the lock state and attempt state - before DOM operations
                if (mountedRef.current) {
                  navigationAttemptRef.current = true;
                  setNavigationLock(true);
                }
                
                // Do thorough DOM cleanup right before navigation
                performDOMCleanup();
                cleanupDOM();
                
                // Wrap navigation in microtask to let React finish its work
                queueMicrotask(() => {
                  // Short delay before actual navigation to let cleanup take effect
                  setTimeout(() => {
                    try {
                      // Log navigation for debugging
                      console.log(`Navigating to ${destination}`);
                      
                      // Pre-mark complete in localStorage before navigation
                      localStorage.setItem('vipProfileComplete', 'true');
                      
                      // Navigate to the destination
                      navigate(destination);
                      
                      // Reset states after navigation with a delay
                      setTimeout(() => {
                        if (!mountedRef.current) return;
                        setNavigationLock(false);
                        navigationAttemptRef.current = false;
                        setIsSaving(false);
                      }, 300);
                    } catch (navError) {
                      console.error("Navigation error:", navError);
                      
                      // Force location change as fallback if React Router navigation fails
                      window.location.href = destination;
                    } finally {
                      resolve();
                    }
                  }, 50);
                });
              } else {
                // No navigation needed, just reset states
                if (mountedRef.current) {
                  setNavigationLock(false);
                  navigationAttemptRef.current = false;
                  setIsSaving(false);
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
          setShowSavingDialog(false);
          setNavigationLock(false);
          navigationAttemptRef.current = false;
          setIsSaving(false);
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
        setShowSavingDialog(false);
        setNavigationLock(false);
        navigationAttemptRef.current = false;
        setIsSaving(false);
      }
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

  // Enhanced discard and navigate function with better state management
  const handleDiscardAndNavigate = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Update states
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    
    // Process navigation if we have a destination
    if (pendingNavigation) {
      const destination = pendingNavigation;
      setPendingNavigation(null);
      
      // Lock navigation to prevent multiple attempts
      setNavigationLock(true);
      navigationAttemptRef.current = true;
      
      // Clean up DOM before navigation
      performDOMCleanup();
      cleanupDOM();
      
      // Use queueMicrotask to ensure React has finished its work
      queueMicrotask(() => {
        // Delay navigation slightly to allow UI updates
        setTimeout(() => {
          if (!mountedRef.current) return;
          
          // Pre-mark complete in localStorage before navigation
          localStorage.setItem('vipProfileComplete', 'true');
          
          // Perform actual navigation
          navigate(destination);
          
          // Reset navigation states after a delay
          setTimeout(() => {
            if (!mountedRef.current) return;
            
            setNavigationLock(false);
            navigationAttemptRef.current = false;
          }, 300);
        }, 50);
      });
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
