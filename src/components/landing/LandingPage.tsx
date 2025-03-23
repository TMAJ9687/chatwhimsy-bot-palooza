
import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Image, Star } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo />
        <Button
          variant="outline"
          size="sm"
          icon={<Star className="h-4 w-4" />}
          iconPosition="left"
        >
          Upgrade to VIP
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row items-center">
        {/* Left column: Features and information */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto md:mx-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-down">
              Anonymous Chat with <span className="text-primary">AI Companions</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 animate-slide-down" style={{ animationDelay: '100ms' }}>
              Connect with AI-powered chat bots for engaging, private conversations. No registration required.
            </p>

            <div className="space-y-6">
              <div className="flex items-start animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Anonymous Conversations</h3>
                  <p className="text-muted-foreground">
                    Chat without sharing personal information. Your privacy is our priority.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Share Images & Media</h3>
                  <p className="text-muted-foreground">
                    Express yourself with images. Standard users get 15 images per day.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Premium VIP Features</h3>
                  <p className="text-muted-foreground">
                    Unlock unlimited images, voice messages, and more with VIP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Nickname generator and profile setup */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex justify-center">
          <div className="frosted-glass w-full max-w-md p-8 rounded-2xl">
            {step === 'nickname' && (
              <NicknameGenerator onNicknameSelected={handleNicknameSelected} />
            )}
            
            {step === 'profile' && (
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
