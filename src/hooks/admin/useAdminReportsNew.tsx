
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import { ReportFeedback } from '@/types/admin';

/**
 * Hook for reports and feedback management that uses AdminContext
 */
export const useAdminReports = () => {
  const { 
    isAdmin,
    setReportsFeedback,
  } = useAdminContext();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load reports and feedback
  const loadReportsAndFeedback = useCallback(async () => {
    if (!isAdmin) return [];
    
    try {
      // In a real implementation, this would fetch from the database
      const reports: ReportFeedback[] = [];
      setReportsFeedback(reports);
      return reports;
    } catch (error) {
      console.error('Error loading reports and feedback:', error);
      return [];
    }
  }, [isAdmin, setReportsFeedback]);
  
  // Add a new report
  const addReport = useCallback(async (userId: string, content: string) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      
      // Mock implementation
      const newReport: ReportFeedback = {
        id: `report-${Date.now()}`,
        type: 'report',
        userId,
        content,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        resolved: false
      };
      
      setReportsFeedback(prev => [...prev, newReport]);
      
      toast({
        title: 'Success',
        description: 'Report added successfully',
      });
      
      return newReport;
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
  
  // Add feedback
  const addFeedback = useCallback(async (userId: string, content: string) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      
      // Mock implementation
      const newFeedback: ReportFeedback = {
        id: `feedback-${Date.now()}`,
        type: 'feedback',
        userId,
        content,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        resolved: false
      };
      
      setReportsFeedback(prev => [...prev, newFeedback]);
      
      toast({
        title: 'Success',
        description: 'Feedback added successfully',
      });
      
      return newFeedback;
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
  
  // Resolve a report or feedback
  const resolveReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Optimistic update
      setReportsFeedback(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, resolved: true } 
            : item
        )
      );
      
      toast({
        title: 'Success',
        description: 'Item resolved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error resolving item:', error);
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
  
  // Delete a report or feedback
  const deleteReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Optimistic update
      setReportsFeedback(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
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
  
  // Cleanup expired reports
  const cleanupExpiredReports = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const now = new Date();
      
      setReportsFeedback(prev => 
        prev.filter(item => item.expiresAt > now)
      );
      
      console.log('Expired reports and feedback cleaned up');
    } catch (error) {
      console.error('Error cleaning up expired reports:', error);
    }
  }, [isAdmin, setReportsFeedback]);
  
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
