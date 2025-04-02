
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminSession from '@/hooks/useAdminSession';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, UserPlus, ShieldAlert, MessageSquare, 
  LogOut, BarChart4, User, Ban, Activity, RefreshCw
} from 'lucide-react';
import Statistics from '@/components/admin/statistics/Statistics';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signOutUser } from '@/firebase/auth';

const AdminDashboard = () => {
  const { isAuthenticated, user, isLoading: sessionLoading } = useAdminSession();
  const { adminLogout, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // If not authenticated as admin, redirect to login
    if (!isAuthenticated && !sessionLoading && !loading) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, navigate, sessionLoading, loading]);
  
  const handleLogout = async () => {
    try {
      // First sign out from Firebase
      await signOutUser();
      // Then run app-specific logout
      await adminLogout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/admin-login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };
  
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
              <Button onClick={() => navigate('/admin-login')}>Go to Login</Button>
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="hidden md:block text-sm text-muted-foreground mr-4">
            Logged in as <span className="font-medium">{user?.email}</span>
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
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Moderation</span>
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Bots</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome to the admin dashboard. Use the tabs above to navigate to different sections.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8,752</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,423</div>
                    <p className="text-xs text-muted-foreground">+5% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Bans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">-2 from last week</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('users')}>
                    <User className="h-6 w-6 mb-2" />
                    <span>Manage Users</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('moderation')}>
                    <Ban className="h-6 w-6 mb-2" />
                    <span>User Bans</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('bots')}>
                    <UserPlus className="h-6 w-6 mb-2" />
                    <span>Manage Bots</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('statistics')}>
                    <BarChart4 className="h-6 w-6 mb-2" />
                    <span>Statistics</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage user accounts, permissions, and status.</p>
              {/* User management content would go here */}
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">User management interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Review and manage banned users, reports, and moderation actions.</p>
              {/* Moderation content would go here */}
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Moderation tools will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage AI chat bots, customize their profiles and responses.</p>
              {/* Bot management content would go here */}
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Bot management interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Review and resolve user-submitted reports and feedback.</p>
              {/* Reports content would go here */}
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Reports dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-4">
          <Statistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
