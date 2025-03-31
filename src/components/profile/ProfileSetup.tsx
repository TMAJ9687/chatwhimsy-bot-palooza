
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import GenderSelector from './GenderSelector';
import AgeSelector from './AgeSelector';
import InterestsSelector from './InterestsSelector';
import AdPlaceholder from './AdPlaceholder';
import { useNicknameValidation } from '@/hooks/useNicknameValidation';
import { toast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  nickname: string;
  onComplete: (profile: {
    gender: string;
    age: number;
    country: string;
    interests: string[];
    isVip: boolean; // Make isVip explicit
  }) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ nickname, onComplete }) => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number>(25);
  const [country, setCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [ageOptions, setAgeOptions] = useState<number[]>([]);
  const [isInterestsOpen, setIsInterestsOpen] = useState<boolean>(false);
  const [profileSubmitted, setProfileSubmitted] = useState<boolean>(false);
  const { validateAndReserveNickname } = useNicknameValidation();

  useEffect(() => {
    const options = [];
    for (let i = 18; i <= 90; i++) {
      options.push(i);
    }
    setAgeOptions(options);
  }, []);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_name) {
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

  const handleSubmit = async () => {
    if (gender && age && country && !profileSubmitted) {
      // Revalidate nickname to ensure it's still available
      try {
        const validation = await validateAndReserveNickname(nickname, false, true);
        if (!validation.valid) {
          toast({
            title: "Nickname Issue",
            description: validation.message,
            variant: "destructive"
          });
          navigate('/');
          return;
        }
      } catch (err) {
        console.error('Error validating nickname:', err);
        // Continue anyway as this is just a double-check
      }
      
      console.log('Saving profile data for standard user');
      setProfileSubmitted(true);
      
      // Save profile data with explicit isVip=false for standard users
      onComplete({
        gender,
        age,
        country,
        interests,
        isVip: false // Explicitly mark as non-VIP
      });
      
      // For standard users, navigation is now handled ONLY in the onComplete callback
      // Don't navigate here to prevent double navigation
    } else {
      console.log('Profile data invalid or already submitted, not navigating');
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
