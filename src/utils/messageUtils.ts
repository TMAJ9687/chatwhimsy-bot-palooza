
import { toast } from "@/hooks/use-toast";
import { STANDARD_CHAR_LIMIT, VIP_CHAR_LIMIT, CONSECUTIVE_LIMIT } from "@/utils/constants";

// Re-export the constants so they can be imported from this file
export { STANDARD_CHAR_LIMIT as MAX_CHAR_LIMIT, VIP_CHAR_LIMIT, CONSECUTIVE_LIMIT };

export const validateImageFile = (file: File, isVip: boolean = false): { valid: boolean; message?: string } => {
  // Check file type
  if (isVip) {
    // VIP users can upload any image type, including GIF
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        message: "Please select an image file."
      };
    }
  } else {
    // Standard users can only upload standard image formats
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return {
        valid: false,
        message: "Please select a JPG, PNG, or WebP image. GIFs are only available for VIP users."
      };
    }
  }
  
  // Check file size (5MB limit for standard, 10MB for VIP)
  const maxSize = isVip ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: isVip 
        ? "Image size should be less than 10MB."
        : "Image size should be less than 5MB. VIP users can upload larger images."
    };
  }
  
  return { valid: true };
};

export const checkCharacterLimit = (
  text: string, 
  isVip: boolean, 
  showToast: boolean = true
): boolean => {
  const limit = isVip ? VIP_CHAR_LIMIT : STANDARD_CHAR_LIMIT;
  
  if (text.length > limit) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: isVip ? 
          `VIP messages are limited to ${VIP_CHAR_LIMIT} characters.` :
          `Messages are limited to ${STANDARD_CHAR_LIMIT} characters. Upgrade to VIP for longer messages.`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string, isVip: boolean = false): boolean => {
  if (!text) return false;
  
  if (isVip) {
    // For VIP: check for 4+ consecutive numbers or 7+ consecutive letters
    const numberPattern = /(\d)\1{3,}/;
    if (numberPattern.test(text)) return true;
    
    const letterPattern = /([a-zA-Z])\1{6,}/;
    if (letterPattern.test(text)) return true;
    
    return false;
  } else {
    // For standard users: check for 3+ consecutive identical characters
    for (let i = 0; i <= text.length - CONSECUTIVE_LIMIT; i++) {
      let isConsecutive = true;
      for (let j = 1; j < CONSECUTIVE_LIMIT; j++) {
        if (text[i] !== text[i + j]) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) return true;
    }
    return false;
  }
};
