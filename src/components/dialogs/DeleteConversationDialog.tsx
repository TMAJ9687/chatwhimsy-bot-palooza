
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
} from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

const DeleteConversationDialog = () => {
  const { state, closeDialog } = useDialog();
  
  // Only render if dialog is open and of type 'deleteConversation'
  if (!state.isOpen || state.type !== 'deleteConversation') {
    return null;
  }
  
  const { userName, onConfirm } = state.data || {};

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
    closeDialog();
  };

  return (
    <AlertDialog open={true} onOpenChange={closeDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash className="h-6 w-6 text-red-500" />
          </div>
          <AlertDialogTitle className="text-center">Delete Conversation</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete your conversation with <strong>{userName}</strong>?
            <p className="mt-2">This will remove all messages and shared media. This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="sm:flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white sm:flex-1"
          >
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConversationDialog;
