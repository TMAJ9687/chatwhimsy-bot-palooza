
import { ReportFeedback } from '@/types/admin';
import * as firestoreReports from '@/firebase/firestore/reportCollection';

/**
 * Add a new report or feedback
 */
export const addReportOrFeedback = async (data: Partial<ReportFeedback>): Promise<ReportFeedback> => {
  try {
    const record = await firestoreReports.addReportOrFeedback({
      ...data,
      type: data.type || 'report'
    });
    
    // Convert to admin ReportFeedback type
    return {
      ...record,
      status: 'open' // Add status for compatibility
    } as ReportFeedback;
  } catch (error) {
    console.error('Error adding report or feedback:', error);
    throw error;
  }
};

/**
 * Get all reports and feedback
 */
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    const records = await firestoreReports.getReportsAndFeedback();
    return records.map(record => ({
      ...record,
      status: 'open' // Add default status for compatibility
    })) as ReportFeedback[];
  } catch (error) {
    console.error('Error getting reports and feedback:', error);
    return [];
  }
};

/**
 * Mark a report or feedback as resolved
 */
export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    return await firestoreReports.resolveReportOrFeedback(id);
  } catch (error) {
    console.error('Error resolving report or feedback:', error);
    return false;
  }
};

/**
 * Delete a report or feedback
 */
export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    return await firestoreReports.deleteReportOrFeedback(id);
  } catch (error) {
    console.error('Error deleting report or feedback:', error);
    return false;
  }
};

/**
 * Clean up expired reports and feedback
 */
export const cleanupExpiredReportsFeedback = async (): Promise<boolean> => {
  try {
    return await firestoreReports.cleanupExpiredReportsFeedback();
  } catch (error) {
    console.error('Error cleaning up expired reports and feedback:', error);
    return false;
  }
};
