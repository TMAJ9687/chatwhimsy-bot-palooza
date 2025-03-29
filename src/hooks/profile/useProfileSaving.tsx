
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VipProfileFormRef } from '@/components/profile/VipProfileForm';
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
  const forcedNavigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (forcedNavigationTimeoutRef.current) {
        clearTimeout(forcedNavigationTimeoutRef.current);
        forcedNavigationTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Safe state update helper function using queueMicrotask for React 18 compatibility
  const safeUpdateState = useCallback((callback: () => void) => {
    if (mountedRef.current) {
      queueMicrotask(() => {
        if (mountedRef.current) {
          unstable_batchedUpdates(callback);
        }
      });
    }
  }, [mountedRef]);

  // Log navigation attempts for debugging
  const logNavigation = useCallback((message: string, destination?: string) => {
    console.log(`[ProfileSaving] ${message}${destination ? ` to ${destination}` : ''}`);
  }, []);

  // Set a backup navigation timer to ensure we don't get stuck
  const setNavigationTimeout = useCallback((destination: string) => {
    // Clear any existing timeout
    if (forcedNavigationTimeoutRef.current) {
      clearTimeout(forcedNavigationTimeoutRef.current);
    }
    
    // Set a new timeout for forced navigation
    forcedNavigationTimeoutRef.current = setTimeout(() => {
      logNavigation('Forced navigation timeout triggered', destination);
      
      // When using window.location, make sure we clear up anything that might block navigation
      try {
        if (document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        }
        
        // Remove any potentially blocking overlays
        document.querySelectorAll(
          '.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay], [role="dialog"], [aria-modal="true"]'
        ).forEach(el => {
          try {
            if (el.parentNode) {
              el.remove();
            }
          } catch (e) {
            // Ignore remove errors
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Force navigation using window.location
      window.location.href = destination;
    }, 5000);
  }, [logNavigation]);

  // Improved save and navigate function with better error handling and state management
  const handleSaveAndNavigate = useCallback(async () => {
    // Prevent multiple save attempts
    if (navigationAttemptRef.current || !mountedRef.current) {
      logNavigation('Save operation already in progress, ignoring request');
      return;
    }
    
    // Set a safety timeout for forced navigation if /chat is the destination
    if (pendingNavigation === '/chat') {
      setNavigationTimeout('/chat');
    }
    
    logNavigation('Starting save and navigate operation', pendingNavigation || undefined);
    
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
        logNavigation('Saving profile form');
        saved = await profileFormRef.current.saveForm();
        logNavigation(`Profile form save ${saved ? 'successful' : 'failed'}`);
      } else {
        // No form to save, so consider it successful
        logNavigation('No profile form to save, proceeding with navigation');
        saved = true;
      }
      
      if (saved) {
        // Mark profile as complete in localStorage
        localStorage.setItem('vipProfileComplete', 'true');
        logNavigation('Set vipProfileComplete to true in localStorage');
        
        // Update unsaved changes state
        if (mountedRef.current) {
          safeUpdateState(() => {
            setHasUnsavedChanges(false);
          });
        }
        
        // Clear any existing timeout
        if (saveOperationTimeoutRef.current) {
          clearTimeout(saveOperationTimeoutRef.current);
          saveOperationTimeoutRef.current = null;
        }
        
        // Wait for UI to update and then proceed with navigation
        saveOperationTimeoutRef.current = setTimeout(() => {
          // Skip further processing if component unmounted
          if (!mountedRef.current) return;
          
          // Close dialogs first using batched updates
          safeUpdateState(() => {
            setShowSavingDialog(false);
            setShowUnsavedDialog(false);
          });
          
          // Add a delay before navigation to let React clean up dialogs
          setTimeout(() => {
            // Skip if component unmounted during timeout
            if (!mountedRef.current) return;
            
            // If we have a pending navigation destination
            if (pendingNavigation) {
              const destination = pendingNavigation;
              logNavigation('Processing pending navigation', destination);
              
              // Clear pending navigation state and update flags
              safeUpdateState(() => {
                setPendingNavigation(null);
                navigationAttemptRef.current = true;
                setNavigationLock(true);
              });
              
              // Pre-mark complete in localStorage before navigation
              localStorage.setItem('vipProfileComplete', 'true');
              
              // Clean up DOM before navigation
              cleanupDOM();
              
              // Use queueMicrotask to ensure React has finished its rendering cycle
              queueMicrotask(() => {
                // Skip if unmounted after microtask
                if (!mountedRef.current) return;
                
                // Perform navigation with React Router
                try {
                  logNavigation('Executing navigation', destination);
                  
                  // Ensure all state updates are complete before navigation
                  unstable_batchedUpdates(() => {
                    // Final cleanup before navigation
                    if (document.body) {
                      document.body.style.overflow = 'auto';
                      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
                    }
                    
                    // Perform the navigation
                    navigate(destination);
                  });
                  
                  // Reset states after navigation with a delay
                  setTimeout(() => {
                    if (mountedRef.current) {
                      safeUpdateState(() => {
                        setNavigationLock(false);
                        navigationAttemptRef.current = false;
                        setIsSaving(false);
                      });
                    }
                    
                    // Clear the forced navigation timeout
                    if (forcedNavigationTimeoutRef.current) {
                      clearTimeout(forcedNavigationTimeoutRef.current);
                      forcedNavigationTimeoutRef.current = null;
                    }
                  }, 300);
                } catch (navError) {
                  console.error("Navigation error:", navError);
                  logNavigation('Error during navigation, falling back to location.href', destination);
                  
                  // Force location change as fallback
                  window.location.href = destination;
                }
              });
            } else {
              // No navigation needed, just reset states
              logNavigation('No pending navigation, resetting states');
              if (mountedRef.current) {
                safeUpdateState(() => {
                  setNavigationLock(false);
                  navigationAttemptRef.current = false;
                  setIsSaving(false);
                });
              }
              
              // Clear the forced navigation timeout
              if (forcedNavigationTimeoutRef.current) {
                clearTimeout(forcedNavigationTimeoutRef.current);
                forcedNavigationTimeoutRef.current = null;
              }
            }
          }, 100);
        }, 500);
      } else {
        // Form validation failed
        if (mountedRef.current) {
          logNavigation('Form validation failed');
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
          
          // Clear the forced navigation timeout
          if (forcedNavigationTimeoutRef.current) {
            clearTimeout(forcedNavigationTimeoutRef.current);
            forcedNavigationTimeoutRef.current = null;
          }
        }
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error during save and navigate:", error);
      logNavigation('Unexpected error during save and navigate operation');
      
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
        
        // Clear the forced navigation timeout
        if (forcedNavigationTimeoutRef.current) {
          clearTimeout(forcedNavigationTimeoutRef.current);
          forcedNavigationTimeoutRef.current = null;
        }
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
    toast,
    logNavigation,
    setNavigationTimeout
  ]);

  // Enhanced discard and navigate function with better state management
  const handleDiscardAndNavigate = useCallback(() => {
    if (!mountedRef.current) return;
    
    logNavigation('Starting discard and navigate operation');
    
    // Update states using batched updates
    safeUpdateState(() => {
      setHasUnsavedChanges(false);
      setShowUnsavedDialog(false);
    });
    
    // Process navigation if we have a destination
    if (pendingNavigation) {
      const destination = pendingNavigation;
      logNavigation('Processing discard and navigate', destination);
      
      // Set a safety timeout for forced navigation
      setNavigationTimeout(destination);
      
      safeUpdateState(() => {
        setPendingNavigation(null);
        setNavigationLock(true);
        navigationAttemptRef.current = true;
      });
      
      // Pre-mark complete in localStorage before navigation
      localStorage.setItem('vipProfileComplete', 'true');
      
      // Cleanup DOM before navigation
      cleanupDOM();
      
      // Use queueMicrotask to ensure React has finished its rendering cycle
      queueMicrotask(() => {
        // Skip if component unmounted after microtask
        if (!mountedRef.current) return;
        
        try {
          logNavigation('Executing navigation', destination);
          
          // Ensure all state updates are complete before navigation
          unstable_batchedUpdates(() => {
            // Final cleanup before navigation
            if (document.body) {
              document.body.style.overflow = 'auto';
              document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
            }
            
            // Perform the navigation
            navigate(destination);
          });
          
          // Reset navigation states after a delay
          setTimeout(() => {
            if (mountedRef.current) {
              safeUpdateState(() => {
                setNavigationLock(false);
                navigationAttemptRef.current = false;
              });
            }
            
            // Clear the forced navigation timeout
            if (forcedNavigationTimeoutRef.current) {
              clearTimeout(forcedNavigationTimeoutRef.current);
              forcedNavigationTimeoutRef.current = null;
            }
          }, 300);
        } catch (navError) {
          console.error("Navigation error:", navError);
          logNavigation('Error during discard navigation, falling back to location.href', destination);
          window.location.href = destination;
        }
      });
    } else {
      // Clear the forced navigation timeout if no navigation happened
      if (forcedNavigationTimeoutRef.current) {
        clearTimeout(forcedNavigationTimeoutRef.current);
        forcedNavigationTimeoutRef.current = null;
      }
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
    setShowUnsavedDialog,
    cleanupDOM,
    logNavigation,
    setNavigationTimeout
  ]);

  return {
    handleSaveAndNavigate,
    handleDiscardAndNavigate
  };
};

// Add React import for useRef
import { useRef } from 'react';
