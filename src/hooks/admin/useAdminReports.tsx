
import { useState, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { ReportFeedback } from '@/types/admin';
import * as adminService from '@/services/admin/adminService';

/**
 * Custom hook for reports and feedback functionality
 */
export const useAdminReports = (isAdmin: boolean) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [reportsFeedback, setReportsFeedback] = useState<ReportFeedback[]>([]);
  
  // Load reports and feedback data
  const loadReportsAndFeedback = useCallback(async () => {
    try {
      console.log('Loading reports and feedback...');
      const loadedReportsFeedback = await adminService.getReportsAndFeedback();
      setReportsFeedback(loadedReportsFeedback);
      console.log(`Loaded ${loadedReportsFeedback.length} reports/feedback`);
      return loadedReportsFeedback;
    } catch (error) {
      console.error('Error loading reports and feedback:', error);
      return [];
    }
  }, []);
  
  // Clean up expired reports and feedback
  const cleanupExpiredReports = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      await adminService.cleanupExpiredReportsFeedback();
      const updatedReports = await adminService.getReportsAndFeedback();
      setReportsFeedback(updatedReports);
    } catch (error) {
      console.error('Error cleaning up expired reports:', error);
    }
  }, [isAdmin]);
  
  // Reports and Feedback
  const addReport = useCallback(async (userId: string, content: string) => {
    if (!user) return null;
    
    try {
      console.log('Adding report for user:', userId);
      
      // Optimistic update
      const tempReport: ReportFeedback = {
        id: `temp-${Date.now()}`,
        type: 'report',
        userId,
        content,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolved: false
      };
      
      setReportsFeedback(prev => [...prev, tempReport]);
      
      const report = await adminService.addReportOrFeedback('report', userId, content);
      
      if (report) {
        // Replace temporary report with the real one
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id).concat(report));
        
        toast({
          title: 'Report Submitted',
          description: 'Your report has been submitted to our admins',
        });
        console.log('Report submitted successfully');
      } else {
        // Remove temporary report if failed
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id));
        console.error('Report submission failed');
      }
      
      return report;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);
  
  const addFeedback = useCallback(async (content: string) => {
    if (!user) return null;
    
    try {
      const feedback = await adminService.addReportOrFeedback('feedback', user.id, content);
        
      if (feedback) {
        setReportsFeedback(prev => [...prev, feedback]);
          
        toast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback',
        });
      }
        
      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);
  
  const resolveReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      // Optimistic update
      setReportsFeedback(prev => 
        prev.map(item => item.id === id ? { ...item, resolved: true } : item)
      );
        
      const success = await adminService.resolveReportOrFeedback(id);
        
      if (success) {
        toast({
          title: 'Success',
          description: 'Item marked as resolved',
        });
      } else {
        // Rollback if failed
        setReportsFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, resolved: false } : item)
        );
      }
        
      return success;
    } catch (error) {
      console.error('Error resolving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve item',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, toast]);
  
  const deleteReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      // Optimistic update
      setReportsFeedback(prev => prev.filter(item => item.id !== id));
        
      const success = await adminService.deleteReportOrFeedback(id);
        
      if (success) {
        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
      } else {
        // Revert on failure by reloading all data
        const updatedReports = await adminService.getReportsAndFeedback();
        setReportsFeedback(updatedReports);
          
        toast({
          title: 'Warning',
          description: 'Could not delete item',
          variant: 'destructive',
        });
      }
        
      return success;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, toast]);
  
  return {
    reportsFeedback,
    loadReportsAndFeedback,
    cleanupExpiredReports,
    addReport,
    addFeedback,
    resolveReportFeedback,
    deleteReportFeedback
  };
};
