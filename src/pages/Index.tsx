import React from 'react';
import { Link } from 'react-router-dom';
import LandingPage from '@/components/landing/LandingPage';
import { useUser } from '@/context/UserContext';

const Index: React.FC = () => {
  const { user } = useUser();
  
  // If user is logged in, redirect to chat
  if (user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Link
          to="/chat"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Go to Chat
        </Link>
      </div>
    );
  }
  
  // Otherwise show landing page
  return <LandingPage />;
};

export default Index;
