
import React, { memo, useCallback } from 'react';
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

// Create a separate event callback component
const BlockUserContent = memo(({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Block User</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to block this user? You won't be able to receive messages from them anymore.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="outline" type="button">
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
  const { toast } = useToast();
  const { userName, onBlockUser } = state.data;
  
  // Use callback to prevent re-creation on each render
  const handleConfirmBlock = useCallback(() => {
    // Call the block user function from props
    if (typeof onBlockUser === 'function') {
      onBlockUser();
    }
    
    // Show a toast notification
    toast({
      title: "User blocked",
      description: `You have blocked ${userName}.`,
      duration: 3000, // Short duration
    });
    
    // Close the dialog
    closeDialog();
  }, [closeDialog, onBlockUser, toast, userName]);

  return (
    <AlertDialog open={state.isOpen && state.type === 'block'} onOpenChange={(open) => !open && closeDialog()}>
      <BlockUserContent onConfirm={handleConfirmBlock} />
    </AlertDialog>
  );
};

export default memo(BlockUserDialog);
