
import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';

// Memoized content component
const SiteRulesContent = memo(({ 
  onAccept, 
  onDecline 
}: { 
  onAccept: () => void; 
  onDecline: () => void; 
}) => (
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-center">Site Rules</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 mt-2">
      <div className="text-red-500 font-medium text-center border-b pb-2">
        Age Restriction: User must be above 18.
      </div>
      <ul className="space-y-2 text-sm list-disc pl-5">
        <li>Be respectful to other users at all times.</li>
        <li>Do not share personal information.</li>
        <li>No harassment, hate speech, or bullying.</li>
        <li>No spamming or flooding the chat with messages.</li>
        <li>No explicit or adult content.</li>
        <li>No solicitation or advertising.</li>
      </ul>
    </div>
    <DialogFooter className="sm:justify-center gap-3 mt-4">
      <Button variant="outline" onClick={onDecline}>
        Decline
      </Button>
      <Button onClick={onAccept}>
        Accept
      </Button>
    </DialogFooter>
  </DialogContent>
));

SiteRulesContent.displayName = 'SiteRulesContent';

// Memoized warning dialog content
const WarningContent = memo(({ 
  onYes, 
  onNo 
}: { 
  onYes: () => void; 
  onNo: () => void; 
}) => (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Warning</AlertDialogTitle>
      <AlertDialogDescription>
        If you don't comply to the site rules you'll be kicked out.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onNo}>No</AlertDialogCancel>
      <AlertDialogAction onClick={onYes}>Yes</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
));

WarningContent.displayName = 'WarningContent';

// Main dialog component
const SiteRulesDialog = () => {
  const { state, closeDialog } = useDialog();
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const { isVip } = useUser();

  // Only destructure when needed
  const isRulesOpen = state.isOpen && state.type === 'siteRules';
  
  // Auto-accept rules for VIP users
  useEffect(() => {
    if (isRulesOpen && isVip && state.data?.onAccept) {
      state.data.onAccept();
      closeDialog();
    }
  }, [isRulesOpen, isVip, state.data, closeDialog]);
  
  // Memoized handlers
  const handleAccept = useCallback(() => {
    // Call the onAccept callback if it exists
    if (state.data?.onAccept) {
      state.data.onAccept();
    }
    // Close the dialog
    closeDialog();
  }, [state.data, closeDialog]);

  const handleDecline = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleWarningYes = useCallback(() => {
    setShowWarning(false);
    navigate('/');
  }, [navigate]);

  const handleWarningNo = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Don't render if dialog isn't open
  if (!isRulesOpen && !showWarning) return null;

  return (
    <>
      <Dialog open={isRulesOpen} onOpenChange={() => {}}>
        <SiteRulesContent 
          onAccept={handleAccept} 
          onDecline={handleDecline} 
        />
      </Dialog>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <WarningContent 
          onYes={handleWarningYes} 
          onNo={handleWarningNo} 
        />
      </AlertDialog>
    </>
  );
};

export default memo(SiteRulesDialog);
