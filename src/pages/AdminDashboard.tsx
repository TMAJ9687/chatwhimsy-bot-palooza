
import React, { useState } from 'react';
import { useAuth } from '@/context/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin, switchToUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  // If switchToUserRole is undefined (when using real Firebase), show a message
  const isMockMode = !!switchToUserRole;

  // Redirect non-admin users
  React.useEffect(() => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need administrator privileges to access this page.',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [isAdmin, navigate, toast]);

  // Handle user role switching (for mock mode only)
  const handleSwitchRole = (role: 'admin' | 'vip' | 'regular' | 'guest') => {
    if (switchToUserRole) {
      switchToUserRole(role);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMockMode ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You are in mock mode. You can switch between different user roles for testing.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="bg-red-100 hover:bg-red-200 text-red-800"
                      onClick={() => handleSwitchRole('admin')}
                    >
                      Switch to Admin
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-purple-100 hover:bg-purple-200 text-purple-800"
                      onClick={() => handleSwitchRole('vip')}
                    >
                      Switch to VIP
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                      onClick={() => handleSwitchRole('regular')}
                    >
                      Switch to Regular
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                      onClick={() => handleSwitchRole('guest')}
                    >
                      Switch to Guest
                    </Button>
                  </div>
                </div>
              ) : (
                <p>User management features will be implemented here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Review and handle user reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No active reports to show.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Site Statistics</CardTitle>
              <CardDescription>
                Overview of platform activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">Total Users</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-green-700 dark:text-green-300">Active Sessions</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-700 dark:text-purple-300">VIP Users</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure global site settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These settings will be implemented soon.
              </p>
              <Button disabled>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
