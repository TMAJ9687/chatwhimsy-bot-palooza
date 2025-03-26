
// This file re-exports all Firebase service functions for backward compatibility
import { getUserProfile, createUserProfile, updateUserProfile } from './firebaseAuth';
import { getSubscription, createSubscription, cancelSubscription } from './firebaseSubscription';
import { submitReport, reportUser } from './firebaseReport';
import { sendMessage, getChatMessages } from './firebaseChat';
import { uploadImage } from './firebaseStorage';
import { blockUser, unblockUser, getBlockedUsers } from './firebaseBlockedUsers';

// Import types
import type { ChatMessage } from './firebaseChat';

// Safe wrapper for API calls to prevent DataCloneError
const safeApiCall = async <T>(apiFn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> => {
  try {
    const result = await apiFn(...args);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Re-export user-related functions with safe wrappers
export const getUserProfile = (...args: Parameters<typeof import('./firebaseAuth').getUserProfile>) => 
  safeApiCall(import('./firebaseAuth').then(m => m.getUserProfile), ...args);

export const createUserProfile = (...args: Parameters<typeof import('./firebaseAuth').createUserProfile>) => 
  safeApiCall(import('./firebaseAuth').then(m => m.createUserProfile), ...args);

export const updateUserProfile = (...args: Parameters<typeof import('./firebaseAuth').updateUserProfile>) => 
  safeApiCall(import('./firebaseAuth').then(m => m.updateUserProfile), ...args);

// Re-export subscription-related functions
export {
  getSubscription,
  createSubscription,
  cancelSubscription
};

// Re-export report-related functions
export {
  submitReport,
  reportUser
};

// Re-export chat-related functions
export {
  sendMessage,
  getChatMessages
};

// Re-export types with proper 'export type' syntax
export type { ChatMessage };

// Re-export storage-related functions
export {
  uploadImage
};

// Re-export blocked-users-related functions
export {
  blockUser,
  unblockUser,
  getBlockedUsers
};
