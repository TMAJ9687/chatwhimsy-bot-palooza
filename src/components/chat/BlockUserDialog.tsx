
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
  // Handle confirm action with proper state management
  const handleConfirm = () => {
    // Call onConfirm first then let the parent handle closing
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to block {userName}? You won't be able to receive messages from them anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button type="button" onClick={onClose}>No</button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button type="button" onClick={handleConfirm}>Yes</button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserDialog;
