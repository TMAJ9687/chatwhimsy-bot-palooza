
import React from 'react';
import LandingPage from '../components/landing/LandingPage';
import AdminButton from '../components/admin/AdminButton';
import { useAuth } from '@/context/FirebaseAuthContext';

const Index = () => {
  const { isAdmin } = useAuth();
  
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
