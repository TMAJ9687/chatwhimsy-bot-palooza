
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NicknameGenerator from './NicknameGenerator';
import { useUser } from '@/context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LandingPage = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { openDialog } = useDialog();

  const handleStart = () => {
    if (nickname.trim().length < 3) {
      alert('Please enter a nickname with at least 3 characters');
      return;
    }

    setUser({
      id: Date.now().toString(),
      name: nickname,
      isVip: false
    });
    
    navigate('/chat');
  };

  const handleVipSignup = () => {
    openDialog('vipSignup', {});
  };

  const handleVipLogin = () => {
    openDialog('vipLogin', {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-500 mb-4">
            ChatGlow
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Connect with interesting people from around the world
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Start Chatting Now
          </h2>

          <div className="mb-6">
            <label 
              htmlFor="nickname" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Choose your nickname:
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="Your nickname"
              maxLength={20}
            />
            
            <NicknameGenerator onSelectNickname={setNickname} />
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            Start Chatting
          </Button>
        </div>

        <div className="w-full max-w-md bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>VIP</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Upgrade to VIP</h2>
              <p className="text-amber-100">Unlock premium features</p>
            </div>
          </div>
          
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✓</span> Unlimited image uploads
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Audio messages
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Read receipts
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Chat history
            </li>
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleVipSignup}
              className="flex-1 bg-white text-orange-500 hover:bg-gray-100"
            >
              Sign Up
            </Button>
            <Button 
              onClick={handleVipLogin}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              variant="outline"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
