
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Button from '../shared/Button';

interface ProfileSetupProps {
  nickname: string;
  onComplete: (profile: {
    gender: string;
    age: number;
    country: string;
    interests: string[];
  }) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ nickname, onComplete }) => {
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number>(25);
  const [country, setCountry] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('');

  const popularInterests = [
    'Music', 'Movies', 'Travel', 'Sports', 'Gaming',
    'Photography', 'Cooking', 'Art', 'Reading', 'Technology',
    'Fashion', 'Fitness', 'Nature', 'Science', 'Animals'
  ];

  // Auto detect country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_name) {
          setCountry(data.country_name);
        } else {
          setCountry('United States'); // Default fallback
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        setCountry('United States'); // Default fallback
      }
    };

    detectCountry();
  }, []);

  const handleAddInterest = () => {
    if (selectedInterest && !interests.includes(selectedInterest)) {
      setInterests([...interests, selectedInterest]);
      setSelectedInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleInterestClick = (interest: string) => {
    if (interests.includes(interest)) {
      handleRemoveInterest(interest);
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = () => {
    if (gender && age && country) {
      onComplete({
        gender,
        age,
        country,
        interests
      });
    }
  };

  const isValid = gender && age >= 18 && country;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-2">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Hi <span className="font-medium text-primary">{nickname}</span>, tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <div className="grid grid-cols-3 gap-3">
            {['Male', 'Female', 'Other'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option.toLowerCase())}
                className={`
                  p-3 rounded-lg text-center transition-all duration-300
                  ${gender === option.toLowerCase() 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white border border-border hover:border-primary/50'}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <div className="glass rounded-lg p-4">
            <input
              type="range"
              min="18"
              max="80"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="text-center mt-2 font-medium text-lg">
              {age} years
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <div className="glass rounded-lg p-4 flex items-center justify-between">
            <span className="text-lg">{country || 'Detecting...'}</span>
            {country && (
              <span className="text-primary">
                <Check className="h-5 w-5" />
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Interests (Optional)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {popularInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestClick(interest)}
                className={`
                  text-sm px-3 py-1.5 rounded-full transition-all duration-300
                  ${interests.includes(interest)
                    ? 'bg-primary/90 text-white'
                    : 'bg-white border border-border hover:border-primary/50'}
                `}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add custom interest..."
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="input-primary flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button 
              onClick={handleAddInterest}
              disabled={!selectedInterest}
              variant="outline"
            >
              Add
            </Button>
          </div>

          {interests.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">Your interests:</div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div key={interest} className="badge-primary">
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1.5 hover:text-accent"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon={<ArrowRight className="h-5 w-5" />}
        iconPosition="right"
        onClick={handleSubmit}
        disabled={!isValid}
      >
        Start Chatting
      </Button>
    </div>
  );
};

export default ProfileSetup;
