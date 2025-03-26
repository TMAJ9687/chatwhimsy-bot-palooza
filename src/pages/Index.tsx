
import React from 'react';
import LandingPage from '../components/landing/LandingPage';
import AdminButton from '../components/admin/AdminButton';
import { useUser } from '@/context/UserContext';

const Index = () => {
  const { isAdmin } = useUser();
  
  return (
    <div className="min-h-screen">
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <AdminButton />
        </div>
      )}
      <LandingPage />
    </div>
  );
};

export default Index;
