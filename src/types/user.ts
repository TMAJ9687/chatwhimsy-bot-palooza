
export type Gender = 'male' | 'female';
export type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';

export interface UserProfile {
  id: string;
  nickname: string;
  name?: string; // Added name property
  email: string;
  gender: Gender;
  age: number;
  country: string;
  interests: string[];
  isVip: boolean;
  isAdmin?: boolean; // Flag for admin status
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate?: Date;
  imagesRemaining: number;
  voiceMessagesRemaining: number;
}

export interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isProfileComplete: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
  isVip: boolean;
  isAdmin: boolean; // Property to check admin status
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
}
