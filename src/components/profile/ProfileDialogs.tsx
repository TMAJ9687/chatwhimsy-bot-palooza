
import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { performDOMCleanup } from '@/utils/errorHandler';
import { unstable_batchedUpdates } from 'react-dom';

interface ProfileDialogsProps {
  showUnsavedDialog: boolean;
  showSavingDialog: boolean;
  isSaving: boolean;
  navigationLock: boolean;
  mountedRef: React.RefObject<boolean>;
  onSaveAndNavigate: () => void;
  onDiscardAndNavigate: () => void;
  setShowUnsavedDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSavingDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileDialogs: React.FC<ProfileDialogsProps> = ({
  showUnsavedDialog,
  showSavingDialog,
  isSaving,
  navigationLock,
  mountedRef,
  onSaveAndNavigate,
  onDiscardAndNavigate,
  setShowUnsavedDialog,
  setShowSavingDialog
}) => {
  // Local state to track internal dialog visibility
  const [internalUnsavedOpen, setInternalUnsavedOpen] = useState(showUnsavedDialog);
  const [internalSavingOpen, setInternalSavingOpen] = useState(showSavingDialog);
  
  // Sync internal state with props
  useEffect(() => {
    if (mountedRef.current) {
      setInternalUnsavedOpen(showUnsavedDialog);
    }
  }, [showUnsavedDialog, mountedRef]);
  
  useEffect(() => {
    if (mountedRef.current) {
      setInternalSavingOpen(showSavingDialog);
    }
  }, [showSavingDialog, mountedRef]);

  // Define a safe state setter that checks if component is still mounted
  const safeSetShowDialog = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    if (mountedRef.current) {
      unstable_batchedUpdates(() => {
        setter(value);
      });
    }
  }, [mountedRef]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      if (!mountedRef.current) {
        // Batch all state updates together for unmounting
        unstable_batchedUpdates(() => {
          setInternalUnsavedOpen(false);
          setInternalSavingOpen(false);
        });
      }
    };
  }, [mountedRef]);

  // Close dialog safely
  const handleCloseUnsavedDialog = useCallback(() => {
    if (mountedRef.current && !isSaving) {
      unstable_batchedUpdates(() => {
        setInternalUnsavedOpen(false);
        safeSetShowDialog(setShowUnsavedDialog, false);
      });
    }
  }, [isSaving, mountedRef, safeSetShowDialog, setShowUnsavedDialog]);

  const handleCloseSavingDialog = useCallback(() => {
    if (mountedRef.current && !isSaving) {
      unstable_batchedUpdates(() => {
        setInternalSavingOpen(false);
        safeSetShowDialog(setShowSavingDialog, false);
      });
    }
  }, [isSaving, mountedRef, safeSetShowDialog, setShowSavingDialog]);

  const handleSaveClick = useCallback(() => {
    if (!isSaving && !navigationLock && mountedRef.current) {
      onSaveAndNavigate();
    }
  }, [isSaving, navigationLock, mountedRef, onSaveAndNavigate]);

  return (
    <>
      {internalUnsavedOpen && (
        <Dialog 
          open={internalUnsavedOpen} 
          onOpenChange={(open) => {
            if (!open && !isSaving && mountedRef.current) {
              handleCloseUnsavedDialog();
            }
          }}
        >
          <DialogContent
            onEscapeKeyDown={(e) => {
              if (isSaving || navigationLock || !mountedRef.current) {
                e.preventDefault();
              }
            }}
            onInteractOutside={(e) => {
              if (isSaving || navigationLock) {
                e.preventDefault();
              }
            }}
            onPointerDownOutside={(e) => {
              if (isSaving || navigationLock) {
                e.preventDefault();
              }
            }}
          >
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. What would you like to do?
            </DialogDescription>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={onDiscardAndNavigate}
                disabled={navigationLock}
              >
                Discard Changes
              </Button>
              <Button 
                onClick={handleSaveClick}
                disabled={isSaving || navigationLock}
              >
                {isSaving ? 'Saving...' : 'Save and Continue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {internalSavingOpen && (
        <AlertDialog 
          open={internalSavingOpen}
          onOpenChange={(open) => {
            if (!open && !isSaving && mountedRef.current) {
              handleCloseSavingDialog();
            }
          }}
        >
          <AlertDialogContent 
            className="max-w-[350px]"
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Saving Profile</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                Please wait while your profile is being saved...
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ProfileDialogs;
