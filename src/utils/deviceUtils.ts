
// Generate a unique device ID for the current browser
export const generateDeviceId = (): string => {
  const key = 'app_device_id';
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    // Generate a unique ID
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15) + 
      '_' + new Date().getTime();
    
    // Store it for future use
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
};

// Check if this device is already registered
export const checkDeviceRegistration = (): string => {
  const deviceId = generateDeviceId();
  return deviceId;
};

// Store last active time in local storage
export const updateLastActiveTime = (): void => {
  localStorage.setItem('last_active_time', new Date().toISOString());
};

// Get last active time from local storage
export const getLastActiveTime = (): Date | null => {
  const lastActiveTime = localStorage.getItem('last_active_time');
  return lastActiveTime ? new Date(lastActiveTime) : null;
};

// Clear chat history based on user role
export const clearChatHistory = (): void => {
  localStorage.removeItem('chat_history');
};
