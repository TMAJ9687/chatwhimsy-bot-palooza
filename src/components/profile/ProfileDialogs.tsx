
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { performDOMCleanup } from '@/utils/errorHandler';

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
  // Clean up dialogs on unmount
  useEffect(() => {
    return () => {
      if (!mountedRef.current) {
        performDOMCleanup();
      }
    };
  }, [mountedRef]);

  // Prevent dialog from showing after component unmounts
  const safeSetShowDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    if (mountedRef.current) {
      setter(value);
    }
  };

  const handleSaveClick = () => {
    if (!isSaving && !navigationLock && mountedRef.current) {
      onSaveAndNavigate();
    }
  };

  return (
    <>
      {showUnsavedDialog && (
        <Dialog 
          open={showUnsavedDialog} 
          onOpenChange={(open) => {
            if (!open && !isSaving && mountedRef.current) {
              setTimeout(() => {
                if (mountedRef.current) {
                  safeSetShowDialog(setShowUnsavedDialog, false);
                }
              }, 100);
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

      {showSavingDialog && (
        <AlertDialog 
          open={showSavingDialog}
          onOpenChange={(open) => {
            if (!open && !isSaving && mountedRef.current) {
              setTimeout(() => {
                if (mountedRef.current) {
                  safeSetShowDialog(setShowSavingDialog, false);
                }
              }, 100);
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
