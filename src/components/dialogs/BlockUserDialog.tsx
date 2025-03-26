
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
import { Loader2 } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

// Memoized dialog content component to prevent unnecessary re-renders
const BlockUserContent = memo(({ 
  onConfirm, 
  onCancel, 
  userName,
  isLoading
}: { 
  onConfirm: () => void;
  onCancel: () => void;
  userName: string;
  isLoading: boolean;
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
          <Button 
            variant="outline" 
            onClick={onCancel} 
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Blocking...
              </>
            ) : (
              "Block User"
            )}
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
  
  // Only destructure when needed
  const isOpen = state.isOpen && state.type === 'block';
  
  // Don't render anything if dialog isn't open
  if (!isOpen) return null;

  const { userName, onBlockUser, blockInProgress = false } = state.data;

  // Use callback to prevent re-creation on each render
  const handleConfirmBlock = useCallback(async () => {
    if (typeof onBlockUser !== 'function') return;
    
    try {
      // Call the block user function and await it
      await onBlockUser();
      // No need to show toast here as it's handled in useChatActions
    } catch (error) {
      console.error("Error in block user dialog:", error);
    }
    
    // Close dialog is now handled based on blockInProgress in the parent
  }, [onBlockUser]);

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && !blockInProgress && closeDialog()}>
      <BlockUserContent 
        onConfirm={handleConfirmBlock} 
        onCancel={closeDialog}
        userName={userName}
        isLoading={blockInProgress}
      />
    </AlertDialog>
  );
};

export default memo(BlockUserDialog);
