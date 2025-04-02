
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const AccountDeletionModal = () => {
  const { state, closeModal } = useModal();
  const { toast } = useToast();
  
  const isOpen = state.isOpen && state.type === 'accountDeletion';
  
  if (!isOpen) return null;
  
  const { onConfirm } = state.data || {};
  
  const handleConfirmDeletion = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    
    toast({
      title: "Account Deleted",
      description: "Your account has been successfully deleted.",
      duration: 5000,
    });
    
    closeModal();
  };

  return (
    <Overlay
      id="account-deletion-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <AlertDialog open={true} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleConfirmDeletion}>
                Delete Account
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Overlay>
  );
};

export default AccountDeletionModal;
