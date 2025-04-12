
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import { ReportFeedback } from '@/types/admin';
import { 
  getReportsAndFeedback, 
  addReportOrFeedback,
  resolveReportOrFeedback,
  deleteReportOrFeedback,
  cleanupExpiredReportsFeedback
} from '@/services/admin/reportAdminService';

/**
 * Hook for reports and feedback management that uses the AdminContext
 */
export const useAdminReports = () => {
  const { 
    isAdmin, 
    setReportsFeedback 
  } = useAdminContext();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load reports and feedback
  const loadReportsAndFeedback = useCallback(async () => {
    if (!isAdmin) return [];
    
    try {
      const items = await getReportsAndFeedback();
      setReportsFeedback(items);
      return items;
    } catch (error) {
      console.error('Error loading reports and feedback:', error);
      return [];
    }
  }, [isAdmin, setReportsFeedback]);
  
  // Clean up expired reports
  const cleanupExpiredReports = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      await cleanupExpiredReportsFeedback();
      // Refresh the list after cleanup
      loadReportsAndFeedback();
    } catch (error) {
      console.error('Error cleaning up expired reports:', error);
    }
  }, [isAdmin, loadReportsAndFeedback]);
  
  // Add a new report
  const addReport = useCallback(async (userId: string, content: string) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      const report = await addReportOrFeedback('report', userId, content);
      
      if (report) {
        setReportsFeedback(prev => [...prev, report]);
        
        toast({
          title: 'Report Added',
          description: 'User report has been recorded'
        });
      }
      
      return report;
    } catch (error) {
      console.error('Error adding report:', error);
      toast({
        title: 'Error',
        description: 'Failed to add report',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, setReportsFeedback]);
  
  // Add new feedback
  const addFeedback = useCallback(async (userId: string, content: string) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      const feedback = await addReportOrFeedback('feedback', userId, content);
      
      if (feedback) {
        setReportsFeedback(prev => [...prev, feedback]);
        
        toast({
          title: 'Feedback Added',
          description: 'User feedback has been recorded'
        });
      }
      
      return feedback;
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to add feedback',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, setReportsFeedback]);
  
  // Resolve a report/feedback
  const resolveReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Optimistic update
      setReportsFeedback(prev => prev.map(item => 
        item.id === id ? { ...item, resolved: true } : item
      ));
      
      const success = await resolveReportOrFeedback(id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item marked as resolved'
        });
      } else {
        // Revert on failure
        setReportsFeedback(prev => prev.map(item => 
          item.id === id ? { ...item, resolved: false } : item
        ));
        
        toast({
          title: 'Error',
          description: 'Failed to resolve item',
          variant: 'destructive',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error resolving report/feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve item',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, setReportsFeedback]);
  
  // Delete a report/feedback
  const deleteReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Store the item for potential rollback
      const itemToDelete = (await getReportsAndFeedback()).find(item => item.id === id);
      
      // Optimistic update
      setReportsFeedback(prev => prev.filter(item => item.id !== id));
      
      const success = await deleteReportOrFeedback(id);
      
      if (!success && itemToDelete) {
        // Rollback if the operation failed
        setReportsFeedback(prev => [...prev, itemToDelete]);
        
        toast({
          title: 'Error',
          description: 'Failed to delete item',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Item deleted successfully'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting report/feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, setReportsFeedback]);
  
  return {
    loadReportsAndFeedback,
    cleanupExpiredReports,
    addReport,
    addFeedback,
    resolveReportFeedback,
    deleteReportFeedback,
    isProcessing
  };
};
