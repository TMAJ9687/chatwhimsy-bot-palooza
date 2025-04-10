
import React, { useState, useEffect } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import { Bot } from '@/types/chat';
import UserEditForm from '@/components/admin/UserEditForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface UserEditDialogProps {}

const UserEditDialog: React.FC<UserEditDialogProps> = () => {
  const { state, closeDialog } = useDialog();
  const [user, setUser] = useState<Bot | null>(null);

  useEffect(() => {
    if (state.data?.user) {
      setUser(state.data.user);
    }
  }, [state.data]);

  const handleSave = (updatedUser: Bot) => {
    if (state.data?.onSave && typeof state.data.onSave === 'function') {
      state.data.onSave(updatedUser);
    }
    closeDialog();
  };

  return (
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and account status.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <UserEditForm user={user} onSave={handleSave} />
        ) : (
          <div className="py-6 text-center">
            <p>No user data available.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
