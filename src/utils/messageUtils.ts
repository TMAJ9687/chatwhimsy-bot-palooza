
import { toast } from "@/hooks/use-toast";
import { MAX_CHAR_LIMIT, CONSECUTIVE_LIMIT } from "@/types/chat";

// Re-export the constants so they can be imported from this file
export { MAX_CHAR_LIMIT, CONSECUTIVE_LIMIT };

export const validateImageFile = (file: File): { valid: boolean; message?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      message: "Please select an image file."
    };
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      message: "Image size should be less than 5MB."
    };
  }
  
  return { valid: true };
};

export const checkCharacterLimit = (
  text: string, 
  isVip: boolean, 
  showToast: boolean = true
): boolean => {
  if (!isVip && text.length > MAX_CHAR_LIMIT) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${MAX_CHAR_LIMIT} characters. Upgrade to VIP for unlimited messaging.`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string): boolean => {
  if (!text) return false;
  
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
};
