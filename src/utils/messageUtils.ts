
/**
 * Utilities for handling and validating messages
 */

// Constants for file validation
const MAX_IMAGE_SIZE_STANDARD = 5 * 1024 * 1024; // 5MB for standard users
const MAX_IMAGE_SIZE_VIP = 20 * 1024 * 1024; // 20MB for VIP users

// Allowed image types
const STANDARD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIP_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Validates an image file based on size and type
 */
export const validateImageFile = (
  file: File, 
  isVip: boolean
): { valid: boolean; message: string } => {
  // Check file size
  const maxSize = isVip ? MAX_IMAGE_SIZE_VIP : MAX_IMAGE_SIZE_STANDARD;
  if (file.size > maxSize) {
    const sizeInMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      message: `File is too large. Maximum size is ${sizeInMb}MB.`
    };
  }
  
  // Check file type
  const allowedTypes = isVip ? VIP_IMAGE_TYPES : STANDARD_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Supported types: ${isVip ? 'JPEG, PNG, WebP, GIF, SVG' : 'JPEG, PNG, WebP'}.`
    };
  }
  
  return { valid: true, message: 'File is valid' };
};
