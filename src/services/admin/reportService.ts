
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportStatus } from '@/types/admin';

/**
 * Get all reports
 */
export const getAllReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('user_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllReports:', error);
    return [];
  }
};

/**
 * Create a new report
 */
export const createReport = async (report: Partial<Report>): Promise<Report | null> => {
  try {
    const reportData = {
      ...report,
      status: report.status || 'pending',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_reports')
      .insert([reportData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating report:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createReport:', error);
    return null;
  }
};

/**
 * Update report status
 */
export const updateReportStatus = async (
  reportId: string, 
  status: ReportStatus, 
  adminNotes?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }
    
    const { error } = await supabase
      .from('user_reports')
      .update(updateData)
      .eq('id', reportId);
    
    if (error) {
      console.error('Error updating report status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    return false;
  }
};

/**
 * Get report details
 */
export const getReportDetails = async (reportId: string): Promise<Report | null> => {
  try {
    const { data, error } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (error) {
      console.error('Error fetching report details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getReportDetails:', error);
    return null;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_reports')
      .delete()
      .eq('id', reportId);
    
    if (error) {
      console.error('Error deleting report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return false;
  }
};
