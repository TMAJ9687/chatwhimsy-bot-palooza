
// Character limits for messages
export const STANDARD_CHAR_LIMIT = 250;
export const VIP_CHAR_LIMIT = 1000;
export const CONSECUTIVE_LIMIT = 3;

// Image upload limits
export const STANDARD_UPLOAD_LIMIT = 15;
export const VIP_UPLOAD_LIMIT = 100;
export const STANDARD_IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const VIP_IMAGE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

// Supported image types
export const STANDARD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const VIP_IMAGE_TYPES = [...STANDARD_IMAGE_TYPES, 'image/gif', 'image/svg+xml'];

// Chat preferences
export const AUTO_SCROLL_THRESHOLD = 100; // pixels
export const DEFAULT_BOT_TYPING_DELAY = 3000; // ms
export const MESSAGE_BATCH_SIZE = 20;
