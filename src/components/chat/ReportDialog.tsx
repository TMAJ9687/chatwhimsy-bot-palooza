
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from "@/hooks/use-toast";

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

// Simplified implementation with fewer state updates and better performance
const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, userName }) => {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedReason(null);
      setOtherReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle reason selection
  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
  };
  
  // Handle other reason input
  const handleOtherReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReason(e.target.value.slice(0, 100));
  };

  // Submit report - simplified version
  const handleSubmit = () => {
    if (!selectedReason) return;
    
    // Set submitting state to prevent multiple submissions
    setIsSubmitting(true);
    
    // Log the report
    console.log('Report submitted:', {
      user: userName,
      reason: selectedReason === 'Other' ? otherReason : selectedReason
    });
    
    // Show toast notification
    toast({
      title: "Report submitted",
      description: "Thank you for helping to keep our community safe.",
    });
    
    // Close the dialog
    onClose();
  };

  // Only render when open to avoid unnecessary renders
  if (!isOpen) return null;

  const isValid = selectedReason && (selectedReason !== 'Other' || otherReason.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting {userName}
          </DialogDescription>
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
              onClick={() => handleSelectReason(reason)}
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
                onChange={handleOtherReasonChange}
                maxLength={100}
                rows={3}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {otherReason.length}/100
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(ReportDialog);
