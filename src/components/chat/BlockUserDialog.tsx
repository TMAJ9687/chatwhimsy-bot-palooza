
import React, { useCallback } from 'react';
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

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  const { toast } = useToast();
  
  // Create a proper confirm handler that doesn't cause state update issues
  const handleConfirm = useCallback(() => {
    // Call onConfirm to handle the blocking logic
    onConfirm();
    
    // Show a toast notification
    toast({
      title: "User blocked",
      description: `You have blocked ${userName}.`,
    });
    
    // Dialog will be closed by parent component
  }, [onConfirm, userName, toast]);

  return (
    <AlertDialog open={isOpen}>
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
              onClick={onClose}
              type="button"
            >
              No, Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive"
              onClick={handleConfirm}
              type="button"
            >
              Yes, Block User
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserDialog;
