
export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  gender: 'male' | 'female';
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

export type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';
