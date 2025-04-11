
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Settings, LogOut, RefreshCw, User, MessageSquare 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

export interface DashboardHeaderProps {
  email?: string;
  handleRetry: () => void;
  toggleChat: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  email, 
  handleRetry, 
  toggleChat 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminLogout } = useAdmin();

  const handleLogout = async () => {
    try {
      // Call the adminLogout function from useAdmin hook
      const success = await adminLogout();
      
      if (success) {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
      } else {
        throw new Error("Logout failed");
      }
      
      // Navigate to login page after successful logout
      navigate('/secretadminportal');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
      
      // Still redirect even if there's an error
      navigate('/secretadminportal');
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        {email && (
          <p className="text-muted-foreground">
            Logged in as <span className="font-medium">{email}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          onClick={toggleChat} 
          variant="outline" 
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Admin Chat
        </Button>
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button 
          onClick={() => navigate('/admin/settings')} 
          variant="outline" 
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button 
          onClick={handleLogout} 
          variant="destructive" 
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
