
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

const BlockUserDialog = () => {
  const { state, closeDialog } = useDialog();
  const { toast } = useToast();
  
  // Check if this dialog is open
  const isOpen = state.isOpen && state.type === 'block';
  
  // Destructure data only when dialog is open to avoid undefined values
  const { userName, userId, onBlockUser } = isOpen ? state.data : { userName: '', userId: '', onBlockUser: null };
  
  // Handle block confirmation
  const handleConfirmBlock = useCallback(() => {
    if (typeof onBlockUser === 'function' && userId) {
      onBlockUser(userId);
    }
    
    // Show a toast notification
    toast({
      title: "User blocked",
      description: `You have blocked ${userName}.`,
    });
    
    // Close the dialog
    closeDialog();
  }, [userName, userId, onBlockUser, toast, closeDialog]);

  // If not open, render nothing
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to block {userName}? You won't be able to receive messages from them anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              onClick={closeDialog}
              type="button"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive"
              onClick={handleConfirmBlock}
              type="button"
            >
              Block User
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default memo(BlockUserDialog);
