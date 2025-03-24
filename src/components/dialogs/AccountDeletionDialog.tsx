
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
import { AlertTriangle, Shield, Mail, Trash } from 'lucide-react';

type DeletionStep = 'initial' | 'warning' | 'password' | 'confirmPassword' | 'emailSent';

const AccountDeletionDialog = () => {
  const { state, closeDialog } = useDialog();
  const { clearUser } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<DeletionStep>('initial');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInitialConfirm = () => {
    setStep('warning');
  };

  const handleWarningConfirm = () => {
    setStep('password');
  };

  const handlePasswordSubmit = () => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (password.trim() === '') {
        setError('Please enter your password');
        return;
      }
      
      // Move to confirm password step
      setStep('confirmPassword');
    }, 1000);
  };

  const handleConfirmPasswordSubmit = () => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (confirmPassword !== password) {
        setError('Passwords do not match');
        return;
      }
      
      setStep('emailSent');
    }, 1000);
  };

  const handleFinalConfirm = () => {
    toast({
      title: "Account Deleted",
      description: "Your VIP account has been successfully deleted.",
      variant: "default",
    });
    
    clearUser();
    closeDialog();
    
    window.location.href = '/';
  };

  React.useEffect(() => {
    if (state.isOpen && state.type === 'accountDeletion') {
      setStep('initial');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [state.isOpen, state.type]);

  // If dialog is not open or not accountDeletion type, don't render anything
  if (!state.isOpen || state.type !== 'accountDeletion') {
    return null;
  }

  if (step === 'initial') {
    return (
      <AlertDialog open={true} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center">
              <Trash className="h-5 w-5 mr-2" />
              Delete VIP Account?
            </AlertDialogTitle>
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
              Yes, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (step === 'warning') {
    return (
      <AlertDialog open={true} onOpenChange={closeDialog}>
        <AlertDialogContent className="border-red-200 dark:border-red-900">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-red-500 text-center">Warning: Permanent Action</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <p className="mb-2">
                Deleting your VIP account will immediately:
              </p>
              <ul className="text-left space-y-1 mx-auto max-w-xs mb-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Permanently delete all your chat history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Cancel your subscription without refund</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Remove all your personal data from our systems</span>
                </li>
              </ul>
              <p>This action <strong>cannot</strong> be reversed.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:flex-1">Keep My Account</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWarningConfirm}
              className="bg-red-500 hover:bg-red-600 text-white sm:flex-1"
            >
              Continue With Deletion
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-red-500 text-center">Confirm Your Identity</DialogTitle>
            <DialogDescription className="text-center">
              For security, please enter your password to confirm account deletion.
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeDialog()}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className="sm:flex-1"
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'confirmPassword') {
    return (
      <Dialog open={true} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-red-500 text-center">Confirm Your Password</DialogTitle>
            <DialogDescription className="text-center">
              Please re-enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('password')}
              className="sm:flex-1"
            >
              Back
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmPasswordSubmit}
              disabled={isLoading}
              className="sm:flex-1"
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <Mail className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-center">Check Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a confirmation email to your registered email address. 
              Please check your inbox and click the link to confirm the deletion of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">Important:</p>
              <p className="text-muted-foreground">
                For demonstration purposes, you can click the button below to simulate clicking the email confirmation link.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDialog()} className="sm:flex-1">Close</Button>
            <Button 
              variant="destructive" 
              onClick={handleFinalConfirm}
              className="sm:flex-1"
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
