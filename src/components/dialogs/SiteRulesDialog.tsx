
import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
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
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

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
  const { cleanupOverlays } = useSafeDOMOperations();
  const mountedRef = useRef(true);
  
  // Only destructure when needed
  const isRulesOpen = state.isOpen && state.type === 'siteRules';
  
  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Clean up overlays when component unmounts
      cleanupOverlays();
    };
  }, [cleanupOverlays]);
  
  useEffect(() => {
    // Auto-accept rules for VIP users
    if (isVip && isRulesOpen && state.options?.onAccept && mountedRef.current) {
      state.options.onAccept();
      closeDialog();
    }
  }, [isVip, isRulesOpen, closeDialog, state]);
  
  // Memoized handlers
  const handleAccept = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Call the onAccept callback if it exists
    if (state.options?.onAccept) {
      state.options.onAccept();
    }
    // Close the dialog
    closeDialog();
  }, [state, closeDialog]);

  const handleDecline = useCallback(() => {
    if (!mountedRef.current) return;
    setShowWarning(true);
  }, []);

  const handleWarningYes = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Immediately clean up dialog contents
    setShowWarning(false);
    closeDialog();
    
    // Force DOM cleanup before navigation
    requestAnimationFrame(() => {
      // Use full page reload to ensure complete state reset
      window.location.href = '/';
    });
  }, [closeDialog]);

  const handleWarningNo = useCallback(() => {
    if (!mountedRef.current) return;
    setShowWarning(false);
  }, []);

  // Don't render for VIP users or if dialog isn't open
  if (isVip || (!isRulesOpen && !showWarning) || !mountedRef.current) return null;

  return (
    <>
      <Dialog open={isRulesOpen} onOpenChange={() => {}}>
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
            <Button variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button onClick={handleAccept}>
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
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
