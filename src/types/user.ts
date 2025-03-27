
export type Gender = 'male' | 'female' | 'other';
export type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  gender: Gender;
  age: number;
  country: string;
  interests: string[];
  isVip: boolean;
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
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
}
