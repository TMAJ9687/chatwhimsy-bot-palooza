
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface SiteRulesDialogProps {
  isOpen: boolean;
  onAccept: () => void;
}

const SiteRulesDialog: React.FC<SiteRulesDialogProps> = ({ isOpen, onAccept }) => {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  const handleDecline = () => {
    setShowWarning(true);
  };

  const handleWarningYes = () => {
    setShowWarning(false);
    navigate('/');
  };

  const handleWarningNo = () => {
    setShowWarning(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
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
            <Button onClick={onAccept}>
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning</AlertDialogTitle>
            <AlertDialogDescription>
              If you don't comply to the site rules you'll be kicked out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleWarningNo}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningYes}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SiteRulesDialog;
