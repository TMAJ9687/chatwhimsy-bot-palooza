
import React from 'react';
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

// Using a simpler component structure with fewer state updates
const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  const { toast } = useToast();
  
  // Single function to handle confirmation and toast
  const handleConfirmBlock = () => {
    // Call the parent's onConfirm handler
    onConfirm();
    
    // Show a toast notification
    toast({
      title: "User blocked",
      description: `You have blocked ${userName}.`,
    });
    
    // No need to call onClose as it will be handled by the parent component
  };

  // Only render when open to avoid unnecessary renders
  if (!isOpen) return null;

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

export default React.memo(BlockUserDialog);
