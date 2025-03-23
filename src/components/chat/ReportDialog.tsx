
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const reportReasons = [
  "Under Age",
  "Harassment/Cyberbullying",
  "Inappropriate Content",
  "Spamming",
  "Impersonation/Scamming",
  "Hate Speech",
  "Other"
];

const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, userName }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setShowConfirmation(true);
    // Here you would normally send the report to your backend
    console.log('Report submitted:', {
      user: userName,
      reason: selectedReason === 'Other' ? otherReason : selectedReason
    });
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(false);
    setSelectedReason(null);
    setOtherReason('');
    setShowConfirmation(false);
    onClose();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setIsSubmitting(false);
  };

  const resetAndClose = () => {
    setSelectedReason(null);
    setOtherReason('');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Report User</DialogTitle>
              <p className="text-center text-gray-500 mt-1">
                Please select a reason for reporting {userName}
              </p>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {reportReasons.map((reason) => (
                <div 
                  key={reason}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                  onClick={() => setSelectedReason(reason)}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedReason === reason ? 'border-teal-500' : 'border-gray-300'
                      }`}
                    >
                      {selectedReason === reason && (
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      )}
                    </div>
                    <span className={`ml-2 ${reason === 'Under Age' ? 'text-red-500 font-medium' : ''}`}>
                      {reason}
                    </span>
                  </div>
                </div>
              ))}

              {selectedReason === 'Other' && (
                <div className="mt-3">
                  <textarea
                    placeholder="Please describe the issue (max 100 characters)"
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value.slice(0, 100))}
                    maxLength={100}
                    rows={3}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {otherReason.length}/100
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={resetAndClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedReason || (selectedReason === 'Other' && !otherReason.trim())}
              >
                Submit Report
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={resetAndClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center p-6">
              <h3 className="text-lg font-medium">Confirm Report</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to submit this report?
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
