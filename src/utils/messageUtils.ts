
import { toast } from "@/hooks/use-toast";
import { MAX_CHAR_LIMIT, VIP_CHAR_LIMIT, CONSECUTIVE_LIMIT, CONSECUTIVE_LETTERS_LIMIT, MAX_VOICE_LENGTH } from "@/types/chat";

// Re-export the constants so they can be imported from this file
export { MAX_CHAR_LIMIT, VIP_CHAR_LIMIT, CONSECUTIVE_LIMIT, CONSECUTIVE_LETTERS_LIMIT, MAX_VOICE_LENGTH };

export const validateImageFile = (file: File, isVip: boolean = false): { valid: boolean; message?: string } => {
  // Check file type
  const isImage = file.type.startsWith('image/');
  const isGif = file.type === 'image/gif';
  
  // VIP users can upload GIFs, standard users only regular images
  if (!isVip && isGif) {
    return {
      valid: false,
      message: "Only VIP users can upload GIF files."
    };
  }
  
  if (!isImage) {
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
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  
  if (text.length > limit) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${limit} characters. ${!isVip ? 'Upgrade to VIP for extended messaging.' : ''}`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string, isVip: boolean = false): boolean => {
  if (!text) return false;
  
  // For VIP users, we allow up to 3 consecutive numbers
  // Regular expression to check for more than 3 consecutive numbers (e.g. "1234")
  const consecutiveNumbersPattern = /(\d)\1\1\1+/;
  if (consecutiveNumbersPattern.test(text)) {
    return true;
  }
  
  // Check for consecutive identical characters
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
  
  // For VIP users, additional check for 6 or more consecutive letters
  if (isVip) {
    const consecutiveLettersPattern = /([a-zA-Z])\1\1\1\1\1+/;
    return consecutiveLettersPattern.test(text);
  }
  
  return false;
};

export const validateVoiceMessage = (duration: number): boolean => {
  return duration <= MAX_VOICE_LENGTH;
};
