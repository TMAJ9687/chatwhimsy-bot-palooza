
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface DashboardLoaderProps {
  isAuthenticated: boolean;
  sessionLoading: boolean;
  loading: boolean;
  retryCount: number;
  handleRetry: () => void;
  redirectToLogin: () => void;
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({
  isAuthenticated,
  sessionLoading,
  loading,
  retryCount,
  handleRetry,
  redirectToLogin
}) => {
  if (!isAuthenticated && !sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-[350px]">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Authentication required</AlertTitle>
              <AlertDescription>
                You need to be logged in as an admin to view this page.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-4">
              <Button onClick={redirectToLogin}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p>Loading admin data...</p>
              {retryCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Attempt {retryCount + 1}...
                </p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
};

export default DashboardLoader;
