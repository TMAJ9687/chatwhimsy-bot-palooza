
import { ReportFeedback } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';

// Local storage key
const REPORT_FEEDBACK_KEY = 'reportFeedback';

// In-memory cache
let reportFeedbackCache: ReportFeedback[] = [];
let initialized = false;

/**
 * Initialize the report service
 */
export const initializeReportService = (): void => {
  if (initialized) return;
  
  // Load reports and feedback
  const storedReportFeedback = localStorage.getItem(REPORT_FEEDBACK_KEY);
  reportFeedbackCache = storedReportFeedback ? JSON.parse(storedReportFeedback) : [];
  
  // Clean up expired reports and feedback
  cleanupExpiredReportsFeedback();
  
  initialized = true;
  
  // Save initialized data back to localStorage
  saveToLocalStorage();
};

/**
 * Save all report data to localStorage
 */
const saveToLocalStorage = (): void => {
  localStorage.setItem(REPORT_FEEDBACK_KEY, JSON.stringify(reportFeedbackCache));
};

/**
 * Add a new report or feedback item
 */
export const addReportOrFeedback = (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): ReportFeedback => {
  initializeReportService();
  
  // Create timestamp for now
  const now = new Date();
  
  // Create expiry date (24 hours from now)
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const item: ReportFeedback = {
    id: uuidv4(),
    type,
    userId,
    content,
    timestamp: now,
    expiresAt,
    resolved: false
  };
  
  reportFeedbackCache.push(item);
  saveToLocalStorage();
  
  return item;
};

/**
 * Get all reports and feedback
 */
export const getReportsAndFeedback = (): ReportFeedback[] => {
  initializeReportService();
  // Clean up expired items before returning
  cleanupExpiredReportsFeedback();
  return [...reportFeedbackCache];
};

/**
 * Mark a report or feedback item as resolved
 */
export const resolveReportOrFeedback = (id: string): boolean => {
  initializeReportService();
  const item = reportFeedbackCache.find(item => item.id === id);
  if (!item) return false;
  
  item.resolved = true;
  saveToLocalStorage();
  return true;
};

/**
 * Delete a report or feedback item
 */
export const deleteReportOrFeedback = (id: string): boolean => {
  initializeReportService();
  const initialLength = reportFeedbackCache.length;
  reportFeedbackCache = reportFeedbackCache.filter(item => item.id !== id);
  
  const deleted = initialLength > reportFeedbackCache.length;
  if (deleted) {
    saveToLocalStorage();
  }
  
  return deleted;
};

/**
 * Remove expired reports and feedback
 */
export const cleanupExpiredReportsFeedback = (): void => {
  const now = new Date();
  const initialLength = reportFeedbackCache.length;
  
  reportFeedbackCache = reportFeedbackCache.filter(item => {
    return new Date(item.expiresAt) > now;
  });
  
  if (initialLength > reportFeedbackCache.length) {
    saveToLocalStorage();
  }
};

/**
 * Schedule automatic cleanup of expired reports and feedback
 */
export const scheduleReportCleanup = (intervalMinutes: number = 15): () => void => {
  // Run cleanup immediately
  cleanupExpiredReportsFeedback();
  
  // Setup interval for regular cleanup
  const intervalId = setInterval(() => {
    cleanupExpiredReportsFeedback();
  }, intervalMinutes * 60 * 1000);
  
  // Return cleanup function to cancel the interval
  return () => clearInterval(intervalId);
};
