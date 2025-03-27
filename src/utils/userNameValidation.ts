
// Validation utility for usernames

// Regular expression to check if a string contains "admin" anywhere
const containsAdmin = (username: string): boolean => {
  return /admin/i.test(username);
};

// Check for consecutive characters (more than 2 of the same character in a row)
const hasConsecutiveChars = (username: string): boolean => {
  return /([a-zA-Z0-9])\1{2,}/.test(username);
};

// Check if the username is alphanumeric
const isAlphanumeric = (username: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(username);
};

export const validateVipUsername = (username: string): { valid: boolean; message: string } => {
  // Check if username is empty
  if (!username.trim()) {
    return { valid: false, message: 'Username cannot be empty.' };
  }

  // Check if username contains "admin"
  if (containsAdmin(username)) {
    return { valid: false, message: 'Username cannot contain "admin".' };
  }

  // Check if username is too long (VIP users can have up to 22 characters)
  if (username.length > 22) {
    return { valid: false, message: 'Username cannot be longer than 22 characters.' };
  }

  // Check if username is too short
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long.' };
  }

  // Check if username has consecutive characters
  if (hasConsecutiveChars(username)) {
    return { valid: false, message: 'Username cannot have more than 2 consecutive identical characters.' };
  }

  // Check if username is alphanumeric
  if (!isAlphanumeric(username)) {
    return { valid: false, message: 'Username can only contain letters and numbers.' };
  }

  // All checks passed, username is valid
  return { valid: true, message: 'Username is valid.' };
};

// This function is less strict for standard users
export const validateStandardUsername = (username: string): { valid: boolean; message: string } => {
  // Check if username is empty
  if (!username.trim()) {
    return { valid: false, message: 'Username cannot be empty.' };
  }

  // Check if username is too long (standard users max 15 characters)
  if (username.length > 15) {
    return { valid: false, message: 'Username cannot be longer than 15 characters.' };
  }

  // Check if username is too short
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long.' };
  }

  // Check if username is alphanumeric
  if (!isAlphanumeric(username)) {
    return { valid: false, message: 'Username can only contain letters and numbers.' };
  }

  // All checks passed, username is valid
  return { valid: true, message: 'Username is valid.' };
};

export const validateUsername = (username: string, isVip: boolean): { valid: boolean; message: string } => {
  return isVip 
    ? validateVipUsername(username) 
    : validateStandardUsername(username);
};
