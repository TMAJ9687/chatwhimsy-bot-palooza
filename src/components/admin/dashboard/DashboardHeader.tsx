
import React from 'react';
import { RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  email: string | undefined;
  handleLogout: () => Promise<void>;
  handleRetry: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  email,
  handleLogout,
  handleRetry
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex items-center space-x-2">
        <div className="hidden md:block text-sm text-muted-foreground mr-4">
          Logged in as <span className="font-medium">{email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetry} title="Refresh dashboard data">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
