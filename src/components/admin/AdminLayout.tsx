
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, MessageSquare, BarChart3, 
  LogOut, Shield, Home, User 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully'
    });
    navigate('/admin/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="flex items-center justify-center h-16 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{admin?.displayName}</p>
              <p className="text-xs text-muted-foreground">{admin?.role}</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/admin/dashboard')}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/admin/site')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Site Management
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/admin/reports')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Reports & Feedback
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/admin/settings')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Admin Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/chat')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Go to Chat
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-6">
          <h2 className="text-lg font-medium">Welcome to the Admin Panel</h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
