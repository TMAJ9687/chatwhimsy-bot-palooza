
import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import Button from '../shared/Button';
import NicknameGenerator from './NicknameGenerator';
import ProfileSetup from '../profile/ProfileSetup';
import { useUser } from '../../context/UserContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useUser();
  const [step, setStep] = useState<'nickname' | 'profile'>('nickname');
  const [nickname, setNickname] = useState('');

  const handleNicknameSelected = (selectedNickname: string) => {
    setNickname(selectedNickname);
    updateUserProfile({ nickname: selectedNickname });
    setStep('profile');
  };

  const handleProfileComplete = (profile: {
    gender: string;
    age: number;
    country: string;
    interests: string[];
  }) => {
    updateUserProfile({
      gender: profile.gender as any,
      age: profile.age,
      country: profile.country,
      interests: profile.interests,
    });
    
    navigate('/chat');
  };
  
  const handleStartChat = () => {
    if (nickname) {
      setStep('profile');
    } else {
      // Generate nickname and then move to profile step
      const randomNickname = 'BoldFox24'; // Placeholder, normally this would be generated
      setNickname(randomNickname);
      updateUserProfile({ nickname: randomNickname });
      setStep('profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#edf4f7] to-[#d9e6f2]">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <span className="sr-only">Toggle theme</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M6.34 17.66l-1.41 1.41"></path>
              <path d="M19.07 4.93l-1.41 1.41"></path>
            </svg>
          </Button>
          <Button
            variant="primary" 
            size="sm"
            className="bg-primary text-white font-semibold rounded-md py-2 px-6"
          >
            VIP
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-12">
        {/* Left column: Logo and tagline */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:text-left mb-12 md:mb-0">
          <div className="max-w-lg">
            <div className="text-primary text-7xl font-bold mb-6">chatwii</div>
            <p className="text-gray-600 text-xl mb-12">
              Connect with people from around the world in real-time conversations
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-full"></div>
              <div className="w-12 h-12 bg-primary rounded-full"></div>
              <div className="w-12 h-12 bg-accent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right column: Chat card */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Text <span className="text-secondary">Anonymously</span></h1>
              <h2 className="text-4xl font-bold mb-6">with <span className="text-primary">no registration</span></h2>
              <p className="text-gray-600">
                Unleash your creativity and connect with like-minded individuals 
                on our chatting website, where conversations come to life.
              </p>
            </div>
            
            {step === 'nickname' ? (
              <div>
                <div className="relative mb-4">
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                    <div className="px-4 py-2 text-lg font-medium flex-1">BoldFox24</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-lg p-2 hover:bg-primary/10"
                      onClick={() => {}}
                      icon={<RefreshCw className="h-5 w-5" />}
                      aria-label="Generate new nickname"
                    >
                      Refresh
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 text-sm text-gray-500 -mt-1 mr-2">9/16</div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="bg-secondary text-white font-semibold py-3 rounded-lg w-full"
                  onClick={handleStartChat}
                >
                  Start Chat
                </Button>
              </div>
            ) : (
              <ProfileSetup 
                nickname={nickname} 
                onComplete={handleProfileComplete} 
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
