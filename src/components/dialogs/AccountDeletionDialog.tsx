
import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

// Step 1: Initial confirmation dialog
// Step 2: Password confirmation dialog
// Step 3: Final confirmation email sent

type DeletionStep = 'initial' | 'password' | 'emailSent';

const AccountDeletionDialog = () => {
  const { state, closeDialog } = useDialog();
  const { clearUser } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<DeletionStep>('initial');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInitialConfirm = () => {
    setStep('password');
  };

  const handlePasswordSubmit = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate API call to verify password
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, accept any password that's not empty
      if (password.trim() === '') {
        setError('Please enter your password');
        return;
      }
      
      // Simulate sending confirmation email
      setStep('emailSent');
    }, 1000);
  };

  const handleFinalConfirm = () => {
    // In a real app, this would happen when the user clicks the confirmation link in their email
    // For now, we'll just clear the user and close the dialog
    toast({
      title: "Account Deleted",
      description: "Your VIP account has been successfully deleted.",
      variant: "default",
    });
    
    clearUser();
    closeDialog();
    
    // Redirect to homepage
    window.location.href = '/';
  };

  // If dialog is not open or not of type 'accountDeletion', return null
  if (!state.isOpen || state.type !== 'accountDeletion') {
    return null;
  }

  if (step === 'initial') {
    return (
      <AlertDialog open={true} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete VIP Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will lose all your VIP benefits, 
              preferences, and personal data. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleInitialConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (step === 'password') {
    return (
      <Dialog open={true} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Please enter your password to confirm your identity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDialog()}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handlePasswordSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Confirm Deletion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'emailSent') {
    return (
      <Dialog open={true} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation Email Sent</DialogTitle>
            <DialogDescription>
              We've sent a confirmation email to your registered email address. 
              Please check your inbox and click the link to confirm the deletion of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              For demo purposes, you can click the button below to simulate clicking the email confirmation link.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDialog()}>Close</Button>
            <Button 
              variant="destructive" 
              onClick={handleFinalConfirm}
            >
              Simulate Email Confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default AccountDeletionDialog;
