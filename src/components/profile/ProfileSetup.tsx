
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../shared/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

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
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [ageOptions, setAgeOptions] = useState<number[]>([]);
  const [isInterestsOpen, setIsInterestsOpen] = useState<boolean>(false);

  const popularInterests = [
    'Music', 'Movies', 'Travel', 'Sports', 'Gaming',
    'Photography', 'Cooking', 'Art', 'Reading', 'Technology',
    'Fashion', 'Fitness', 'Nature', 'Science', 'Animals'
  ];

  // Generate age options from 18 to 90
  useEffect(() => {
    const options = [];
    for (let i = 18; i <= 90; i++) {
      options.push(i);
    }
    setAgeOptions(options);
  }, []);

  // Auto detect country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_name) {
          // Skip Israel
          if (data.country_name.toLowerCase() === 'israel') {
            setCountry('Palestine');
            setCountryFlag('ps');
          } else {
            setCountry(data.country_name);
            setCountryFlag(data.country_code.toLowerCase());
          }
        } else {
          setCountry('United States');
          setCountryFlag('us');
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        setCountry('United States');
        setCountryFlag('us');
      }
    };

    detectCountry();
  }, []);

  const handleInterestClick = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      // Limit to 2 interests for standard users
      if (interests.length < 2) {
        setInterests([...interests, interest]);
      }
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
      <div className="text-center mb-2">
        <p className="text-primary font-medium">
          Hi {nickname}
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
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-card border border-border hover:border-primary/50'}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <select
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full bg-card border border-border rounded-lg p-3 text-foreground"
          >
            {ageOptions.map((option) => (
              <option key={option} value={option}>
                {option} years
              </option>
            ))}
          </select>
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

        <Collapsible
          open={isInterestsOpen}
          onOpenChange={setIsInterestsOpen}
          className="border border-border rounded-lg p-3 mt-3"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
            <span>Interests (optional)</span>
            {isInterestsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {popularInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestClick(interest)}
                  className={`
                    text-sm px-3 py-1.5 rounded-full transition-all duration-300
                    ${interests.includes(interest)
                      ? 'bg-primary/90 text-white'
                      : 'bg-card border border-border hover:border-primary/50'}
                    ${interests.length >= 2 && !interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={interests.length >= 2 && !interests.includes(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
            {interests.length === 2 && (
              <p className="text-xs text-muted-foreground">
                Standard users can select up to 2 interests. Upgrade to VIP for more!
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* AdSense Placeholder */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="h-16 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Google AdSense Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
