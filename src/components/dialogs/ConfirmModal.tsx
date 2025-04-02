
import React from 'react';
import { useModal } from '@/context/ModalContext';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ConfirmModal = () => {
  const { state, closeModal } = useModal();
  
  const isOpen = state.isOpen && state.type === 'confirm';
  
  if (!isOpen) return null;
  
  const { title, message, onConfirm, confirmText, cancelText } = state.data || {};
  
  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    closeModal();
  };

  return (
    <Overlay
      id="confirm-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <AlertDialog open={true} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title || 'Confirm Action'}</AlertDialogTitle>
            <AlertDialogDescription>
              {message || 'Are you sure you want to proceed with this action?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={closeModal}>
                {cancelText || 'Cancel'}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleConfirm}>
                {confirmText || 'Confirm'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Overlay>
  );
};

export default ConfirmModal;
