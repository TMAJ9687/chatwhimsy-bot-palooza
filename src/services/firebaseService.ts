
// This file re-exports all Firebase service functions for backward compatibility
import { getUserProfile as getUserProfileOriginal, 
         createUserProfile as createUserProfileOriginal, 
         updateUserProfile as updateUserProfileOriginal } from './firebaseAuth';
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
export const getUserProfile = async (userId: string) => {
  try {
    return await getUserProfileOriginal(userId);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, data: any) => {
  try {
    return await createUserProfileOriginal(userId, data);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    return await updateUserProfileOriginal(userId, data);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

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
