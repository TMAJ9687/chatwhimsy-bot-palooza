
// This file re-exports all Firebase service functions for backward compatibility
import { getUserProfile, createUserProfile, updateUserProfile } from './firebaseAuth';
import { getSubscription, createSubscription, cancelSubscription } from './firebaseSubscription';
import { submitReport, reportUser } from './firebaseReport';
import { sendMessage, getChatMessages, ChatMessage } from './firebaseChat';
import { uploadImage } from './firebaseStorage';
import { blockUser, unblockUser, getBlockedUsers } from './firebaseBlockedUsers';

// Re-export all functions
export {
  // User related
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  
  // Subscription related
  getSubscription,
  createSubscription,
  cancelSubscription,
  
  // Report related
  submitReport,
  reportUser,
  
  // Chat related
  sendMessage,
  getChatMessages,
  ChatMessage,
  
  // Storage related
  uploadImage,
  
  // Blocked users related
  blockUser,
  unblockUser,
  getBlockedUsers
};
