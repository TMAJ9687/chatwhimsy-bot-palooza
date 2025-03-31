
import { useState, useCallback } from 'react';
import { ReportFeedback } from '@/types/admin';
import { toast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export const useAdminReports = () => {
  const [reports, setReports] = useState<ReportFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading reports and feedback...');
      
      // First clean up expired reports
      await cleanupExpiredReports();
      
      // Get reports from Supabase
      const { data, error } = await supabaseAdmin
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const loadedReports = data || [];
      console.log(`Loaded ${loadedReports.length} reports/feedback`);
      setReports(loadedReports as ReportFeedback[]);
    } catch (error) {
      console.error('Error getting documents from reports:', error);
      toast({
        title: "Error loading reports",
        description: "There was a problem loading the reports data.",
        variant: "destructive"
      });
      // Initialize with empty array on error
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanupExpiredReports = useCallback(async () => {
    try {
      // Get expiry days from settings
      const { data: settingsData, error: settingsError } = await supabaseAdmin
        .from('admin_settings')
        .select('reportExpiryDays')
        .single();
      
      if (settingsError) {
        console.warn('Error getting report expiry days:', settingsError);
        return;
      }
      
      const expiryDays = settingsData?.reportExpiryDays || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - expiryDays);
      
      // Delete old resolved reports
      const { error } = await supabaseAdmin
        .from('reports')
        .delete()
        .lt('timestamp', expiryDate.toISOString())
        .in('status', ['resolved', 'dismissed']);
      
      if (error) {
        console.error('Error cleaning up expired reports:', error);
      }
    } catch (error) {
      console.error('Error cleaning up expired reports and feedback:', error);
    }
  }, []);

  const updateReportStatus = useCallback(async (reportId: string, status: ReportFeedback['status'], adminNotes?: string) => {
    try {
      const updates = {
        status,
        adminNotes: adminNotes || undefined
      };
      
      // Update report in Supabase
      const { data, error } = await supabaseAdmin
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state
        setReports(prev => 
          prev.map(report => report.id === reportId ? { ...report, ...updates } : report)
        );
        
        toast({
          title: "Report updated",
          description: `Report status updated to ${status}.`
        });
        
        return true;
      }
      
      throw new Error('No data returned from report update');
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error updating report",
        description: "There was a problem updating the report status.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      // Delete report from Supabase
      const { error } = await supabaseAdmin
        .from('reports')
        .delete()
        .eq('id', reportId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      toast({
        title: "Report deleted",
        description: "The report has been deleted successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error deleting report",
        description: "There was a problem deleting the report.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    reports,
    loading,
    loadReports,
    updateReportStatus,
    deleteReport
  };
};
