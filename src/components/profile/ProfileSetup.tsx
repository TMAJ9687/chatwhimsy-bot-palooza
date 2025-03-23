
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Flag } from 'lucide-react';
import Button from '../shared/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  const [countryCode, setCountryCode] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('');

  const popularInterests = [
    'Music', 'Movies', 'Travel', 'Sports', 'Gaming',
    'Photography', 'Cooking', 'Art', 'Reading', 'Technology',
    'Fashion', 'Fitness', 'Nature', 'Science', 'Animals'
  ];

  // Age options for dropdown
  const ageOptions = Array.from({ length: 73 }, (_, i) => i + 18);

  // Auto detect country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_name && data.country_name !== 'Israel') {
          setCountry(data.country_name);
          setCountryCode(data.country_code.toLowerCase());
        } else {
          // If Israel is detected or country is undefined, default to United States
          setCountry('United States');
          setCountryCode('us');
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        setCountry('United States');
        setCountryCode('us');
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
        <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
        <p className="text-muted-foreground">
          Hi <span className="font-medium text-primary">{nickname}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            {['Male', 'Female'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option.toLowerCase())}
                className={`
                  p-3 rounded-lg text-center transition-all duration-300
                  ${gender === option.toLowerCase() 
                    ? 'bg-primary text-white shadow-sm dark:bg-primary/80' 
                    : 'bg-white border border-border hover:border-primary/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <Select
            value={age.toString()}
            onValueChange={(value) => setAge(parseInt(value))}
          >
            <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Select your age" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {ageOptions.map((ageOption) => (
                <SelectItem key={ageOption} value={ageOption.toString()}>
                  {ageOption} years
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Where are you from</label>
          <div className="glass rounded-lg p-4 flex items-center justify-between bg-white dark:bg-gray-700 border border-border dark:border-gray-600">
            {countryCode && (
              <img 
                src={`https://flagcdn.com/w80/${countryCode}.png`} 
                alt={country} 
                className="h-6 mr-3"
              />
            )}
            <span className="text-lg flex-1 dark:text-white">{country || 'Detecting...'}</span>
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
                    ? 'bg-primary/90 text-white dark:bg-primary/80'
                    : 'bg-white border border-border hover:border-primary/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
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
              className="input-primary flex-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-md border border-input p-2"
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button 
              onClick={handleAddInterest}
              disabled={!selectedInterest}
              variant="outline"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              Add
            </Button>
          </div>

          {interests.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">Your interests:</div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div key={interest} className="badge-primary dark:bg-primary/20 dark:text-white px-3 py-1 rounded-full bg-primary/10 flex items-center">
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
        className="dark:bg-primary/80"
      >
        Start Chatting
      </Button>
    </div>
  );
};

export default ProfileSetup;
