
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/FirebaseAuthContext';
import { Shield } from 'lucide-react';

const AdminNav: React.FC = () => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        to="/admin" 
        className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
        title="Admin Dashboard"
      >
        <Shield size={20} />
      </Link>
    </div>
  );
};

export default AdminNav;
