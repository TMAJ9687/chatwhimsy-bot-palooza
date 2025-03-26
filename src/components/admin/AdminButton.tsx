
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/FirebaseAuthContext';

const AdminButton: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <Button 
      onClick={() => navigate('/admin')}
      variant="destructive"
      className="flex items-center gap-2"
    >
      <Shield size={16} />
      Admin Dashboard
    </Button>
  );
};

export default AdminButton;
