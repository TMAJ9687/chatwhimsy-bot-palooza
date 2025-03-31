
import React, { memo, useCallback, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { useToast } from "@/hooks/use-toast";
import { useDialog } from '@/context/DialogContext';
import { useModal } from '@/context/ModalContext';

// Memoized dialog content component to prevent unnecessary re-renders
const BlockUserContent = memo(({ 
  onConfirm, 
  onCancel, 
  userName 
}: { 
  onConfirm: () => void;
  onCancel: () => void;
  userName: string; 
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Block User</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to block {userName}? You won't be able to receive messages from them anymore.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={onConfirm} type="button">
            Block User
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
});

BlockUserContent.displayName = 'BlockUserContent';

// Main dialog component
const BlockUserDialog = () => {
  const { state, closeDialog } = useDialog();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  
  // Only destructure when needed
  const isOpen = state.isOpen && state.type === 'block';
  
  // Use requestAnimationFrame to debounce block action
  const handleConfirmBlock = useCallback(() => {
    if (!isOpen) return;
    
    // Use requestAnimationFrame to prevent UI freeze
    requestAnimationFrame(() => {
      const { userName, userId, onBlockUser } = state.data;
      
      // Call the block user function from props with userId
      if (typeof onBlockUser === 'function' && userId) {
        onBlockUser(userId);
      }
      
      // Show a toast notification with minimal options
      toast({
        title: "User blocked",
        description: `You have blocked ${userName}.`,
        duration: 3000,
      });
      
      // Close the dialog and modal
      closeModal();
      closeDialog();
    });
  }, [isOpen, state.data, toast, closeDialog, closeModal]);

  // Open the modal when the dialog state changes
  useEffect(() => {
    if (isOpen) {
      const { userName } = state.data;
      openModal(
        <BlockUserContent 
          onConfirm={handleConfirmBlock} 
          onCancel={() => {
            closeModal();
            closeDialog();
          }}
          userName={userName}
        />
      );
    }
  }, [isOpen, state.data, openModal, handleConfirmBlock, closeDialog, closeModal]);

  // Nothing to render here as the actual rendering happens via the modal context
  return null;
};

export default memo(BlockUserDialog);
