
import { User } from 'firebase/auth';
import { makeSerializable } from '@/utils/serialization';

// Mock user roles
export type UserRole = 'admin' | 'vip' | 'regular' | 'guest';

// Mock user interface extending Firebase User
export interface MockUser extends Omit<User, 'delete' | 'getIdToken'> {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  role: UserRole;
  isVip: boolean;
  isAdmin: boolean;
  photoURL: string | null;
  emailVerified: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: any[];
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

// Create mock users for testing
const createMockUser = (
  uid: string, 
  displayName: string, 
  email: string | null = null, 
  isAnonymous: boolean = false,
  role: UserRole = 'regular'
): MockUser => {
  return {
    uid,
    email,
    displayName,
    isAnonymous,
    role,
    isVip: role === 'vip' || role === 'admin',
    isAdmin: role === 'admin',
    photoURL: null,
    emailVerified: !isAnonymous && email !== null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    delete: async () => Promise.resolve(),
    getIdToken: async () => Promise.resolve("mock-token-" + uid),
    // Add other required User properties
    phoneNumber: null,
    refreshToken: "mock-refresh-token",
    tenantId: null,
    providerId: isAnonymous ? "anonymous" : "password",
    toJSON: () => ({ uid, displayName, email }),
  };
};

// Create some mock users
export const mockUsers: Record<string, MockUser> = {
  admin: createMockUser("admin-123", "Admin User", "admin@example.com", false, "admin"),
  vip: createMockUser("vip-456", "VIP User", "vip@example.com", false, "vip"),
  regular: createMockUser("user-789", "Regular User", "user@example.com", false, "regular"),
  guest: createMockUser("guest-101", "Guest User", null, true, "guest")
};

// Mock active user (starts with guest)
let currentMockUser: MockUser | null = mockUsers.guest;

// Mock authentication functions
export const signInAsGuest = async (nickname: string): Promise<MockUser> => {
  console.log("Mock: Signing in as guest with nickname:", nickname);
  const guestUser = createMockUser(
    `guest-${Date.now()}`,
    nickname,
    null,
    true,
    "guest"
  );
  currentMockUser = guestUser;
  return guestUser;
};

export const signInUser = async (email: string, password: string): Promise<MockUser> => {
  console.log("Mock: Signing in with email:", email);
  
  // Check if we have a mock user with this email
  const foundUser = Object.values(mockUsers).find(user => user.email === email);
  
  if (foundUser && password === "correct-password") {
    currentMockUser = foundUser;
    return foundUser;
  }
  
  throw new Error("Invalid email or password");
};

export const registerUser = async (email: string, password: string, nickname: string): Promise<MockUser> => {
  console.log("Mock: Registering new user:", email, nickname);
  
  // Create a new regular user
  const newUser = createMockUser(
    `user-${Date.now()}`,
    nickname,
    email,
    false,
    "regular"
  );
  
  // Add to mock users collection
  mockUsers[newUser.uid] = newUser;
  currentMockUser = newUser;
  return newUser;
};

export const getCurrentUser = (): MockUser | null => {
  return currentMockUser;
};

export const signOut = async (): Promise<void> => {
  console.log("Mock: Signing out");
  currentMockUser = null;
  return Promise.resolve();
};

export const updateProfile = async (user: MockUser, updates: { displayName?: string; photoURL?: string }): Promise<void> => {
  console.log("Mock: Updating profile", updates);
  
  if (updates.displayName) {
    user.displayName = updates.displayName;
  }
  
  if (updates.photoURL) {
    user.photoURL = updates.photoURL;
  }
  
  return Promise.resolve();
};

// Mock user profile functions
export const getUserProfile = async (userId: string) => {
  console.log("Mock: Getting user profile for", userId);
  
  const user = Object.values(mockUsers).find(u => u.uid === userId) || currentMockUser;
  
  if (!user) return null;
  
  return makeSerializable({
    nickname: user.displayName,
    email: user.email,
    isVip: user.isVip,
    isAdmin: user.isAdmin,
    isAnonymous: user.isAnonymous,
    role: user.role,
    imagesRemaining: user.isVip ? Infinity : 15,
    voiceMessagesRemaining: user.isVip ? Infinity : 0,
    createdAt: user.metadata.creationTime,
    lastSeen: new Date().toISOString(),
    blockedUsers: []
  });
};

export const createUserProfile = async (userId: string, data: any) => {
  console.log("Mock: Creating user profile for", userId, data);
  return true;
};

export const updateUserProfile = async (userId: string, data: any) => {
  console.log("Mock: Updating user profile for", userId, data);
  
  const user = Object.values(mockUsers).find(u => u.uid === userId) || currentMockUser;
  
  if (user) {
    if (data.nickname) {
      user.displayName = data.nickname;
    }
    
    if (data.role) {
      user.role = data.role;
      user.isVip = data.role === 'vip' || data.role === 'admin';
      user.isAdmin = data.role === 'admin';
    }
    
    // Update VIP status directly if specified
    if (data.isVip !== undefined) {
      user.isVip = data.isVip;
      if (data.isVip && user.role === 'regular') {
        user.role = 'vip';
      }
    }
    
    if (data.isAdmin !== undefined) {
      user.isAdmin = data.isAdmin;
      if (data.isAdmin) {
        user.role = 'admin';
        user.isVip = true;
      }
    }
  }
  
  return true;
};

// Create a convenient function to switch between mock users for testing
export const switchMockUser = (userType: 'admin' | 'vip' | 'regular' | 'guest'): MockUser => {
  currentMockUser = mockUsers[userType];
  return currentMockUser;
};
