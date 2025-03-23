
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
  // Handle confirm action
  const handleConfirm = () => {
    onConfirm();
    // Don't call onClose here, let the parent component handle it
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
          <AlertDialogCancel onClick={() => onClose()}>No</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserDialog;
