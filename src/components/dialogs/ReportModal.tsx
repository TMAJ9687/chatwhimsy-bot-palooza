
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { useModal } from '@/context/ModalContext';
import { useToast } from "@/hooks/use-toast";

const reportReasons = [
  "Under Age",
  "Harassment/Cyberbullying",
  "Inappropriate Content",
  "Spamming",
  "Impersonation/Scamming",
  "Hate Speech",
  "Other"
];

const ReportModal: React.FC = () => {
  const { state, closeModal } = useModal();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get userName from modal data
  const { userName } = state.data;
  
  // Reset state when modal opens
  React.useEffect(() => {
    if (state.isOpen && state.type === 'report') {
      setSelectedReason(null);
      setOtherReason('');
      setIsSubmitting(false);
    }
  }, [state.isOpen, state.type]);
  
  // Handle reason selection
  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
  };
  
  // Handle other reason input
  const handleOtherReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReason(e.target.value.slice(0, 100));
  };
  
  // Submit report
  const handleSubmit = () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    // Log the report data
    console.log('Report submitted:', {
      user: userName,
      reason: selectedReason === 'Other' ? otherReason : selectedReason
    });
    
    // Show success toast
    toast({
      title: "Report submitted",
      description: "Thank you for helping to keep our community safe.",
    });
    
    // Close modal
    closeModal();
  };
  
  const isOpen = state.isOpen && state.type === 'report';
  const isValid = selectedReason && (selectedReason !== 'Other' || otherReason.trim().length > 0);
  
  return (
    <Overlay
      id="report-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto z-50">
        <h2 className="text-xl font-semibold mb-2">Report User</h2>
        <p className="text-gray-600 mb-4">
          Please select a reason for reporting {userName}
        </p>
        
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
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

export default ReportModal;
