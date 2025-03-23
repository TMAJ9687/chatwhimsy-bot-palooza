
// Simple utility to track image upload limits by IP
// This relies on localStorage for persistence between sessions
// In a real app, this would be tracked on the server

interface ImageUploadTracker {
  ip: string;
  dailyUploads: number;
  lastResetDate: string;
}

export const IMAGE_UPLOAD_LIMIT = 10;

// Get the current date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Initialize or get the tracker from localStorage
const getTracker = async (): Promise<ImageUploadTracker> => {
  try {
    // Try to get IP address
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const ip = data.ip || 'unknown';
    
    const storedTrackerJson = localStorage.getItem(`image-upload-tracker-${ip}`);
    
    if (storedTrackerJson) {
      const tracker: ImageUploadTracker = JSON.parse(storedTrackerJson);
      const today = getTodayDateString();
      
      // Reset counter if it's a new day
      if (tracker.lastResetDate !== today) {
        tracker.dailyUploads = 0;
        tracker.lastResetDate = today;
      }
      
      return tracker;
    }
    
    // Initialize a new tracker
    return {
      ip,
      dailyUploads: 0,
      lastResetDate: getTodayDateString()
    };
  } catch (error) {
    console.error('Error fetching IP or initializing tracker:', error);
    // Fallback
    return {
      ip: 'unknown',
      dailyUploads: 0,
      lastResetDate: getTodayDateString()
    };
  }
};

// Save the tracker to localStorage
const saveTracker = (tracker: ImageUploadTracker): void => {
  localStorage.setItem(`image-upload-tracker-${tracker.ip}`, JSON.stringify(tracker));
};

// Check if the user has reached their daily limit
export const canUploadImage = async (isVip: boolean = false): Promise<boolean> => {
  // VIP users have unlimited uploads
  if (isVip) return true;
  
  const tracker = await getTracker();
  return tracker.dailyUploads < IMAGE_UPLOAD_LIMIT;
};

// Get the number of remaining uploads for today
export const getRemainingUploads = async (isVip: boolean = false): Promise<number> => {
  // VIP users have unlimited uploads
  if (isVip) return Infinity;
  
  const tracker = await getTracker();
  return Math.max(0, IMAGE_UPLOAD_LIMIT - tracker.dailyUploads);
};

// Track a new image upload
export const trackImageUpload = async (): Promise<number> => {
  const tracker = await getTracker();
  
  // Increment the counter
  tracker.dailyUploads += 1;
  
  // Save the updated tracker
  saveTracker(tracker);
  
  // Return remaining uploads
  return Math.max(0, IMAGE_UPLOAD_LIMIT - tracker.dailyUploads);
};
