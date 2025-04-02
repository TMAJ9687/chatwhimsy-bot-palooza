
import React, { memo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const BlockUserModal = () => {
  const { state, closeModal } = useModal();
  const { toast } = useToast();
  
  const isOpen = state.isOpen && state.type === 'block';
  
  // Don't render anything if modal isn't open
  if (!isOpen) return null;
  
  const { userName, userId, onBlockUser } = state.data;
  
  const handleConfirmBlock = () => {
    // Call the block user function from props with userId
    if (typeof onBlockUser === 'function' && userId) {
      onBlockUser(userId);
    }
    
    // Show a toast notification
    toast({
      title: "User blocked",
      description: `You have blocked ${userName}.`,
      duration: 3000,
    });
    
    // Close the dialog
    closeModal();
  };

  return (
    <Overlay
      id="block-user-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <AlertDialog open={true} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {userName}? You won't be able to receive messages from them anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleConfirmBlock} type="button">
                Block User
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Overlay>
  );
};

export default memo(BlockUserModal);
