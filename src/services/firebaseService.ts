
// This file re-exports all Firebase service functions for backward compatibility
import { getUserProfile as getUserProfileOriginal, 
         createUserProfile as createUserProfileOriginal, 
         updateUserProfile as updateUserProfileOriginal } from './firebaseAuth';
import { getSubscription, createSubscription, cancelSubscription } from './firebaseSubscription';
import { submitReport, reportUser } from './firebaseReport';
import { sendMessage, getChatMessages } from './firebaseChat';
import { uploadImage } from './firebaseStorage';
import { blockUser, unblockUser, getBlockedUsers } from './firebaseBlockedUsers';
import { safeApiCall, makeSerializable } from '@/utils/serialization';

// Import types
import type { ChatMessage } from './firebaseChat';

// Re-export user-related functions with safe wrappers
export const getUserProfile = async (userId: string) => {
  return safeApiCall(getUserProfileOriginal, userId);
};

export const createUserProfile = async (userId: string, data: any) => {
  return safeApiCall(createUserProfileOriginal, userId, makeSerializable(data));
};

export const updateUserProfile = async (userId: string, data: any) => {
  return safeApiCall(updateUserProfileOriginal, userId, makeSerializable(data));
};

// Re-export subscription-related functions with safe wrappers
export const getSubscriptionSafe = async (userId: string) => {
  return safeApiCall(getSubscription, userId);
};

export const createSubscriptionSafe = async (userId: string, plan: string, endDate: Date) => {
  return safeApiCall(createSubscription, userId, plan, endDate);
};

export const cancelSubscriptionSafe = async (userId: string) => {
  return safeApiCall(cancelSubscription, userId);
};

// Re-export report-related functions with safe wrappers
export const submitReportSafe = async (data: any) => {
  return safeApiCall(submitReport, makeSerializable(data));
};

export const reportUserSafe = async (reporterId: string, reportedUserId: string, reason: string, details?: string) => {
  return safeApiCall(reportUser, reporterId, reportedUserId, reason, details);
};

// Re-export chat-related functions with safe wrappers
export const sendMessageSafe = async (chatId: string, messageData: any) => {
  return safeApiCall(sendMessage, chatId, makeSerializable(messageData));
};

export const getChatMessagesSafe = async (chatId: string) => {
  return safeApiCall(getChatMessages, chatId);
};

// Re-export storage-related functions with safe wrappers
export const uploadImageSafe = async (userId: string, file: File, path: string) => {
  return safeApiCall(uploadImage, userId, file, path);
};

// Re-export blocked-users-related functions with safe wrappers
export const blockUserSafe = async (userId: string, blockedUserId: string) => {
  return safeApiCall(blockUser, userId, blockedUserId);
};

export const unblockUserSafe = async (userId: string, blockedUserId: string) => {
  return safeApiCall(unblockUser, userId, blockedUserId);
};

export const getBlockedUsersSafe = async () => {
  return safeApiCall(getBlockedUsers);
};

// For backward compatibility, re-export the original functions as well
export {
  getSubscription,
  createSubscription,
  cancelSubscription,
  submitReport,
  reportUser,
  sendMessage,
  getChatMessages,
  uploadImage,
  blockUser,
  unblockUser,
  getBlockedUsers
};

// Re-export types with proper 'export type' syntax
export type { ChatMessage };
