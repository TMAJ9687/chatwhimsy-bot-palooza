
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Gender = 'male' | 'female';
type Interest = string;
type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';
type UserRole = 'standard' | 'vip' | 'admin';
type UserStatus = 'online' | 'away' | 'offline';

interface UserProfile {
  id?: string;
  nickname: string;
  gender?: Gender;
  age?: number;
  country?: string;
  interests?: Interest[];
  email?: string;
  isVip?: boolean;
  subscriptionTier?: SubscriptionTier;
  subscriptionEndDate?: Date;
  imagesRemaining?: number;
  voiceMessagesRemaining?: number;
  role?: UserRole;
  status?: UserStatus;
  devices?: string[];
  lastActive?: Date;
  loginTime?: Date;
}

interface SessionConfig {
  maxDevices: number;
  inactivityTimeout: number | null; // null means no timeout
  historyClearTimeout: number; // in hours
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isProfileComplete: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
  isVip: boolean;
  isAdmin: boolean;
  userRole: UserRole;
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
  sessionConfig: SessionConfig;
  userActivity: () => void;
  checkInactivity: () => boolean;
  shouldClearHistory: () => boolean;
  addUserDevice: (deviceId: string) => boolean;
  removeUserDevice: (deviceId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Get standard session config values
const getSessionConfig = (role: UserRole): SessionConfig => {
  switch (role) {
    case 'standard':
      return {
        maxDevices: 1,
        inactivityTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
        historyClearTimeout: 0, // Clear immediately on logout
      };
    case 'vip':
      return {
        maxDevices: 2,
        inactivityTimeout: null, // No timeout
        historyClearTimeout: 8, // 8 hours
      };
    case 'admin':
      return {
        maxDevices: Infinity, // Unlimited devices
        inactivityTimeout: null, // No timeout
        historyClearTimeout: 24, // 24 hours
      };
    default:
      return {
        maxDevices: 1,
        inactivityTimeout: 30 * 60 * 1000,
        historyClearTimeout: 0,
      };
  }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());

  const isProfileComplete = Boolean(
    user && user.gender && user.age && user.country
  );

  const isVip = Boolean(user?.isVip);
  const isAdmin = user?.role === 'admin';
  const userRole = user?.role || 'standard';
  
  // Get session config based on user role
  const sessionConfig = getSessionConfig(userRole);

  // Record user activity
  const userActivity = () => {
    setLastActivityTime(new Date());
    if (user) {
      updateUserProfile({ lastActive: new Date() });
    }
  };

  // Check if user should be logged out due to inactivity
  const checkInactivity = (): boolean => {
    if (!user || !sessionConfig.inactivityTimeout) return false;
    
    const now = new Date();
    const inactiveTime = now.getTime() - lastActivityTime.getTime();
    return inactiveTime > sessionConfig.inactivityTimeout;
  };

  // Check if history should be cleared based on logout time
  const shouldClearHistory = (): boolean => {
    if (!user || !user.loginTime) return true;
    
    const now = new Date();
    const logoutTime = new Date(user.loginTime);
    logoutTime.setHours(logoutTime.getHours() + sessionConfig.historyClearTimeout);
    
    return now > logoutTime;
  };

  // Add a device to user's devices list
  const addUserDevice = (deviceId: string): boolean => {
    if (!user) return false;
    
    const currentDevices = user.devices || [];
    
    // Check if device is already in the list
    if (currentDevices.includes(deviceId)) return true;
    
    // Check if user has reached device limit
    if (currentDevices.length >= sessionConfig.maxDevices) return false;
    
    // Add device to list
    updateUserProfile({
      devices: [...currentDevices, deviceId]
    });
    
    return true;
  };

  // Remove a device from user's devices list
  const removeUserDevice = (deviceId: string) => {
    if (!user || !user.devices) return;
    
    const updatedDevices = user.devices.filter(d => d !== deviceId);
    updateUserProfile({ devices: updatedDevices });
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) {
        // If first login, set login time
        if (!profile.loginTime) {
          profile.loginTime = new Date();
        }
        return profile as UserProfile;
      }
      return { ...prev, ...profile };
    });
  };

  const clearUser = () => {
    setUser(null);
  };

  const subscribeToVip = (tier: SubscriptionTier) => {
    let endDate = new Date();
    
    switch(tier) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'semiannual':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        break;
    }
    
    updateUserProfile({ 
      isVip: true, 
      subscriptionTier: tier,
      subscriptionEndDate: endDate,
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity,
      role: 'vip',
      status: 'online'
    });
  };
  
  const cancelVipSubscription = () => {
    updateUserProfile({ 
      isVip: false, 
      subscriptionTier: 'none',
      subscriptionEndDate: undefined,
      imagesRemaining: 15,
      voiceMessagesRemaining: 0,
      role: 'standard'
    });
  };

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      userActivity();
    };
    
    // Register event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Set initial login time if not set
    if (user && !user.loginTime) {
      updateUserProfile({ loginTime: new Date() });
    }
    
    // Set up inactivity check timer
    const checkTimer = setInterval(() => {
      if (checkInactivity()) {
        // Log out user if inactive too long
        clearUser();
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkTimer);
    };
  }, [user, sessionConfig]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isProfileComplete,
        updateUserProfile,
        clearUser,
        isVip,
        isAdmin,
        userRole,
        subscribeToVip,
        cancelVipSubscription,
        sessionConfig,
        userActivity,
        checkInactivity,
        shouldClearHistory,
        addUserDevice,
        removeUserDevice
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
