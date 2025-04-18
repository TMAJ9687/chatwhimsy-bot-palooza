
import React from 'react';
import LandingPage from '../components/landing/LandingPage';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <>
      <LandingPage />
      {/* Hidden link to admin portal - barely visible for authorized users to find */}
      <div className="fixed bottom-1 right-1 opacity-30 hover:opacity-100 text-[8px] transition-opacity">
        <Link to="/secretadminportal" className="text-gray-400 hover:text-gray-600">Admin</Link>
      </div>
    </>
  );
};

export default Index;
