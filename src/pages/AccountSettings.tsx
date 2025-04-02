
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Button from '@/components/shared/Button';
import { Gender } from '@/types/user';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, cancelVipSubscription } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || 0);
  const [gender, setGender] = useState<Gender>(user?.gender || 'male');
  const [country, setCountry] = useState(user?.country || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);

  // Handle profile save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      updateUserProfile({
        nickname,
        email,
        age,
        gender,
        country,
        interests
      });
      
      alert('Profile updated successfully!');
    }
  };

  // Handle interest toggle
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Handle subscription cancel
  const handleCancelSubscription = () => {
    const confirm = window.confirm(
      'Are you sure you want to cancel your VIP subscription? You will lose access to VIP features at the end of your billing period.'
    );
    
    if (confirm) {
      cancelVipSubscription();
      alert('Your subscription has been canceled.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate('/chat')}
            >
              Back to Chat
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'subscription'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('subscription')}
            >
              Subscription
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Age
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['sports', 'movies', 'music', 'travel', 'food', 'art', 'technology'].map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            interests.includes(interest)
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
                  {user?.isVip ? (
                    <div className="mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">VIP Membership</span>
                        <span className="font-medium text-gray-900 dark:text-white">Active</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-700 dark:text-gray-300">Subscription Tier</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{user.subscriptionTier}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-700 dark:text-gray-300">Renewal Date</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.subscriptionEndDate 
                            ? new Date(user.subscriptionEndDate).toLocaleDateString() 
                            : 'Never (Lifetime)'}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={handleCancelSubscription}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300">You are currently on a free plan.</p>
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          onClick={() => navigate('/pricing')}
                        >
                          Upgrade to VIP
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing History</h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">No billing history available.</p>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="chat-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="chat-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Chat notifications
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="show-online-status"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="show-online-status" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Show online status
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="show-read-receipts"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="show-read-receipts" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Show read receipts
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
