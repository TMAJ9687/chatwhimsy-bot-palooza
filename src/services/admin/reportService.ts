
import { ReportFeedback } from '@/types/admin';
import * as firestoreService from '@/firebase/firestore';

/**
 * Add a new report or feedback
 */
export const addReportOrFeedback = async (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): Promise<ReportFeedback> => {
  return await firestoreService.addReportOrFeedback(type, userId, content);
};

/**
 * Get all reports and feedback
 */
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    return await firestoreService.getReportsAndFeedback();
  } catch (error) {
    console.error('Error getting reports/feedback, using empty array:', error);
    return [];
  }
};

/**
 * Mark a report or feedback as resolved
 */
export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  return await firestoreService.resolveReportOrFeedback(id);
};

/**
 * Delete a report or feedback
 */
export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  return await firestoreService.deleteReportOrFeedback(id);
};

/**
 * Clean up expired reports and feedback
 */
export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  await firestoreService.cleanupExpiredReportsFeedback();
};
