
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
      
      // Close the dialog
      closeDialog();
    });
  }, [isOpen, state.data, toast, closeDialog]);

  // Don't render anything if dialog isn't open
  if (!isOpen) return null;

  const { userName } = state.data;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <BlockUserContent 
        onConfirm={handleConfirmBlock} 
        onCancel={closeDialog}
        userName={userName}
      />
    </AlertDialog>
  );
};

export default memo(BlockUserDialog);
