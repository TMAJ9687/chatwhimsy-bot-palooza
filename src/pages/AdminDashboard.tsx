
import React, { useState } from 'react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

type TabType = 'overview' | 'users' | 'reports' | 'settings';

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAdminSession('/admin-login');
  const { bots, bannedUsers, adminActions, reportsFeedback, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isAuthenticated) {
    return null; // This component is protected - the hook will handle the redirect
  }

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : bots.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : bots.filter(bot => bot.vip).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : bannedUsers.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : reportsFeedback.filter(item => item.type === 'report' && !item.resolved).length}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="reports">Reports & Feedback</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest admin actions taken</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p>Loading activity...</p>
                    ) : adminActions.length > 0 ? (
                      <div className="space-y-2">
                        {adminActions
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 5)
                          .map(action => (
                            <div key={action.id} className="border-b pb-2">
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-semibold capitalize">{action.actionType}</span>{' '}
                                  action on {action.targetType} {action.targetId}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(action.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p>No recent activity</p>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reports</CardTitle>
                      <CardDescription>Latest user reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p>Loading reports...</p>
                      ) : reportsFeedback.filter(item => item.type === 'report').length > 0 ? (
                        <div className="space-y-2">
                          {reportsFeedback
                            .filter(item => item.type === 'report')
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 5)
                            .map(report => (
                              <div key={report.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                  <div>
                                    <span className="font-semibold">Report</span> for user {report.userId}
                                  </div>
                                  <span className={`text-sm ${report.resolved ? 'text-green-500' : 'text-red-500'}`}>
                                    {report.resolved ? 'Resolved' : 'Pending'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{report.content}</p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p>No reports found</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>User Feedback</CardTitle>
                      <CardDescription>Latest user feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p>Loading feedback...</p>
                      ) : reportsFeedback.filter(item => item.type === 'feedback').length > 0 ? (
                        <div className="space-y-2">
                          {reportsFeedback
                            .filter(item => item.type === 'feedback')
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 5)
                            .map(feedback => (
                              <div key={feedback.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                  <div>
                                    <span className="font-semibold">Feedback</span> from user {feedback.userId}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(feedback.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{feedback.content}</p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p>No feedback found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Users Tab - Just a placeholder for now */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage users, VIP status, and bans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>User management functionality will go here.</p>
                    <Button variant="outline" className="mt-4">View all users</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reports Tab - Just a placeholder for now */}
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports & Feedback</CardTitle>
                    <CardDescription>Review and manage user reports and feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Reports and feedback management will go here.</p>
                    <Button variant="outline" className="mt-4">View all reports</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Settings Tab - Just a placeholder for now */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>Configure dashboard settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Admin settings will go here.</p>
                    <Button variant="outline" className="mt-4">Save settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
