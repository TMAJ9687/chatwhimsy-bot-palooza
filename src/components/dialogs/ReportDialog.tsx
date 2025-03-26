
import React, { useState } from 'react';
import { useDialog } from '@/context/DialogContext';
import { useAuth } from '@/context/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'spam', label: 'Spam or scam' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
];

const ReportDialog = () => {
  const { currentDialog, closeDialog } = useDialog();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>('inappropriate');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // If this isn't a report dialog or we don't have data, don't render
  if (currentDialog?.id !== 'report' || !currentDialog.data) {
    return null;
  }

  const { userId, userName } = currentDialog.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast({
        title: "Error",
        description: "Please select a reason for the report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Add report to Firestore
      const reportRef = await addDoc(collection(db, "reports"), {
        reportedUserId: userId,
        reportedUserName: userName,
        reporterId: currentUser?.uid,
        reporterEmail: currentUser?.email,
        reason: selectedReason,
        details: details,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      if (reportRef.id) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe.",
        });
        closeDialog();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Report User</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        You are reporting {userName}. Our moderation team will review your report.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Reason for report</h3>
            <RadioGroup 
              value={selectedReason} 
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {REPORT_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Additional details (optional)</h3>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any specific details about the issue..."
              className="resize-none h-24"
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReportDialog;
