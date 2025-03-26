
// This file re-exports all Firebase service functions for backward compatibility
import { getUserProfile, createUserProfile, updateUserProfile } from './firebaseAuth';
import { getSubscription, createSubscription, cancelSubscription } from './firebaseSubscription';
import { submitReport, reportUser } from './firebaseReport';
import { sendMessage, getChatMessages, type ChatMessage } from './firebaseChat';
import { uploadImage } from './firebaseStorage';
import { blockUser, unblockUser, getBlockedUsers } from './firebaseBlockedUsers';

// Re-export user-related functions
export {
  getUserProfile,
  createUserProfile,
  updateUserProfile
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
