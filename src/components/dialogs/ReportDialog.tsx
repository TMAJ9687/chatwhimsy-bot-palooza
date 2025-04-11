
import React, { useState, useEffect, memo, useCallback } from 'react';
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
import { useDialog } from '@/context/DialogContext';

// Define report reasons outside component to prevent recreation
const reportReasons = [
  "Under Age",
  "Harassment/Cyberbullying",
  "Inappropriate Content",
  "Spamming",
  "Impersonation/Scamming",
  "Hate Speech",
  "Other"
];

// Memoized radio option component
const ReasonOption = memo(({ 
  reason, 
  isSelected, 
  onSelect 
}: { 
  reason: string; 
  isSelected: boolean; 
  onSelect: (reason: string) => void;
}) => (
  <div 
    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
      isSelected 
        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 dark:border-teal-400' 
        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
    }`}
    onClick={() => onSelect(reason)}
    role="radio"
    aria-checked={isSelected}
  >
    <div className="flex items-center">
      <div 
        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
          isSelected ? 'border-teal-500 dark:border-teal-400' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400"></div>
        )}
      </div>
      <span className={`ml-2 ${reason === 'Under Age' ? 'text-red-500 dark:text-red-400 font-medium' : 'dark:text-gray-200'}`}>
        {reason}
      </span>
    </div>
  </div>
));

ReasonOption.displayName = 'ReasonOption';

// Main optimized dialog component
const ReportDialog = () => {
  const { state, closeDialog } = useDialog();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isOpen = state.isOpen && state.type === 'report';
  const { userName } = state.options || {};

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(null);
      setOtherReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Memoized handlers to prevent recreating functions on every render
  const handleSelectReason = useCallback((reason: string) => {
    setSelectedReason(reason);
  }, []);
  
  const handleOtherReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReason(e.target.value.slice(0, 100));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    // Use requestAnimationFrame to prevent UI freezing
    requestAnimationFrame(() => {
      // Show toast notification using a single update
      toast({
        title: "Report submitted",
        description: "Thank you for helping to keep our community safe.",
        duration: 3000,
      });
      
      // Close the dialog
      closeDialog();
    });
  }, [selectedReason, closeDialog, toast]);

  // Compute this once per render rather than in every invocation
  const isValid = selectedReason && (selectedReason !== 'Other' || otherReason.trim().length > 0);

  // If dialog isn't open or isn't the report type, don't render
  if (!isOpen) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting {userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-3" role="radiogroup" aria-label="Report reasons">
          {reportReasons.map((reason) => (
            <ReasonOption
              key={reason}
              reason={reason}
              isSelected={selectedReason === reason}
              onSelect={handleSelectReason}
            />
          ))}

          {selectedReason === 'Other' && (
            <div className="mt-3">
              <textarea
                placeholder="Please describe the issue (max 100 characters)"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-gray-200"
                value={otherReason}
                onChange={handleOtherReasonChange}
                maxLength={100}
                rows={3}
                aria-label="Other reason description"
              />
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1" aria-live="polite">
                {otherReason.length}/100
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={closeDialog}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            type="button"
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ReportDialog);
