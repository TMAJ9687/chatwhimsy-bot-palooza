
export type Gender = 'male' | 'female';
export type Interest = string;
export type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';

export interface UserProfile {
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
