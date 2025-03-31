
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useDialog } from '@/context/DialogContext';
import { useModal } from '@/context/ModalContext';

// Memoized dialog content component to prevent unnecessary re-renders
const AlertDialogContent = memo(({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Mark component as unmounted when it's about to be removed
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <DialogContent 
      ref={contentRef}
      className="sm:max-w-[425px]" 
      onEscapeKeyDown={onClose}
      onInteractOutside={(e) => {
        // Prevent closing during animations
        if (!mountedRef.current) {
          e.preventDefault();
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onClose}>OK</Button>
      </DialogFooter>
    </DialogContent>
  );
});

AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogComponent = () => {
  const { state, closeDialog } = useDialog();
  const { openModal, closeModal } = useModal();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method using our modal context
  const handleClose = useCallback(() => {
    closeModal();
    closeDialog();
  }, [closeDialog, closeModal]);
  
  // Open the modal when the dialog state changes
  useEffect(() => {
    if (isOpen) {
      const { title, message } = state.data;
      openModal(
        <AlertDialogContent
          title={title}
          message={message}
          onClose={handleClose}
        />
      );
    }
  }, [isOpen, state.data, openModal, handleClose]);
  
  // Nothing to render here as the actual rendering happens via the modal context
  return null;
};

export default memo(AlertDialogComponent);
