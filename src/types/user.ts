
export interface UserProfile {
  id?: string;
  displayName?: string;
  email?: string;
  gender?: string;
  age?: number;
  country?: string;
  interests?: string[];
  isVip?: boolean;
  subscriptionTier?: SubscriptionTier;
  subscriptionEndDate?: Date;
  avatar?: string;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'ultimate';

export interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isProfileComplete: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
  isVip: boolean;
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
  isUserBlocked?: (userId: string) => boolean;
}
