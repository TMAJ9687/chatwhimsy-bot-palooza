
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Gender = 'male' | 'female' | 'other';
type Interest = string;

interface UserProfile {
  nickname: string;
  gender?: Gender;
  age?: number;
  country?: string;
  interests?: Interest[];
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isProfileComplete: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const isProfileComplete = Boolean(
    user && user.gender && user.age && user.country
  );

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return profile as UserProfile;
      return { ...prev, ...profile };
    });
  };

  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isProfileComplete,
        updateUserProfile,
        clearUser,
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
