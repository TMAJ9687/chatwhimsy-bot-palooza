
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

/**
 * Generate a UUID
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Create a session token for temporary users
 */
export const createSessionToken = (userId: string): string => {
  // Generate a random token
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  
  // Combine user ID with random parts for token
  return `${userId.substring(0, 8)}_${timestamp}_${randomPart}`;
};

/**
 * Extract user ID from session token
 */
export const getUserIdFromToken = (token: string): string | null => {
  if (!token || !token.includes('_')) return null;
  
  try {
    // Get the user ID part from the token
    const userIdPart = token.split('_')[0];
    return userIdPart;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Validate session token format
 */
export const isValidTokenFormat = (token: string): boolean => {
  return Boolean(
    token && 
    typeof token === 'string' && 
    token.length >= 20 && 
    token.includes('_')
  );
};

/**
 * Get token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('temporaryUserToken');
};

/**
 * Clear stored token from localStorage
 */
export const clearStoredToken = (): void => {
  localStorage.removeItem('temporaryUserToken');
};

/**
 * Handle token expiration by showing a toast and clearing storage
 */
export const handleTokenExpiration = (): void => {
  clearStoredToken();
  localStorage.removeItem('chatUser');
  
  toast({
    title: 'Session expired',
    description: 'Your session has expired. Please log in again.',
    variant: 'destructive',
  });
};
