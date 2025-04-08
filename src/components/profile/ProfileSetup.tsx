
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import GenderSelector from './GenderSelector';
import AgeSelector from './AgeSelector';
import InterestsSelector from './InterestsSelector';
import AdPlaceholder from './AdPlaceholder';

interface ProfileSetupProps {
  nickname: string;
  onComplete: (profile: {
    gender: string;
    age: number;
    country: string;
    interests: string[];
    isVip: boolean;
  }) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ nickname, onComplete }) => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number>(25);
  const [country, setCountry] = useState<string>('United States');
  const [countryFlag, setCountryFlag] = useState<string>('us');
  const [interests, setInterests] = useState<string[]>([]);
  const [ageOptions, setAgeOptions] = useState<number[]>([]);
  const [isInterestsOpen, setIsInterestsOpen] = useState<boolean>(false);
  const [profileSubmitted, setProfileSubmitted] = useState<boolean>(false);
  const onCompleteCalled = useRef(false);

  // Generate age options once on mount
  useEffect(() => {
    const options = [];
    for (let i = 18; i <= 90; i++) {
      options.push(i);
    }
    setAgeOptions(options);
  }, []);

  const handleSubmit = () => {
    if (gender && age && country && !profileSubmitted && !onCompleteCalled.current) {
      setProfileSubmitted(true);
      onCompleteCalled.current = true;
      
      // Save profile data with explicit isVip=false for standard users
      onComplete({
        gender,
        age,
        country,
        interests,
        isVip: false // Explicitly mark as non-VIP
      });
    }
  };

  const isValid = gender && age >= 18 && country;

  const handleBackToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to home page using react-router for a smoother transition
    navigate('/');
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={handleBackToLanding}
          className="text-primary hover:text-primary/80 transition-colors"
          aria-label="Back to landing page"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="text-primary font-medium">
          Hi {nickname}
        </p>
        <div className="w-5"></div>
      </div>

      <div className="space-y-4">
        <GenderSelector gender={gender} setGender={setGender} />
        <AgeSelector age={age} setAge={setAge} ageOptions={ageOptions} />

        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={<ArrowRight className="h-5 w-5" />}
          iconPosition="right"
          onClick={handleSubmit}
          disabled={!isValid || profileSubmitted}
        >
          Start Chatting
        </Button>

        <InterestsSelector 
          interests={interests}
          setInterests={setInterests}
          isOpen={isInterestsOpen}
          setIsOpen={setIsInterestsOpen}
        />

        <AdPlaceholder />
      </div>
    </div>
  );
};

export default ProfileSetup;
