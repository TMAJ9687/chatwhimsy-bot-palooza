
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader, LogOut, RefreshCw, UserPlus } from 'lucide-react';
import AdminStatistics from '@/components/admin/AdminStatistics';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminSession();
  const {
    isAdmin,
    loading,
    isProcessing,
    bots,
    vipUsers,
    standardUsers,
    bannedUsers,
    adminActions,
    reportsFeedback,
    createBot,
    updateBot,
    deleteBot,
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    resolveReportFeedback,
    deleteReportFeedback,
    adminLogout
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('users');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }
  
  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };
  
  if (!isAdmin || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p>You need admin privileges to view this page.</p>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Go to Admin Login
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center" disabled={isProcessing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button onClick={handleLogout} variant="destructive" className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports & Feedback</TabsTrigger>
          <TabsTrigger value="bans">Bans & Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Total Users</h3>
                <p className="text-3xl font-bold">{bots.length}</p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">VIP Users</h3>
                <p className="text-3xl font-bold">{vipUsers.length}</p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Standard Users</h3>
                <p className="text-3xl font-bold">{standardUsers.length}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User List</h3>
              <div className="rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bots.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        bots.map((bot) => (
                          <tr key={bot.id} className="border-b">
                            <td className="px-4 py-3">{bot.name}</td>
                            <td className="px-4 py-3">{bot.email || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                bot.vip 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {bot.vip ? 'VIP' : 'Standard'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    if (bot.vip) {
                                      downgradeToStandard(bot.id);
                                    } else {
                                      upgradeToVIP(bot.id, '1 Month');
                                    }
                                  }}
                                >
                                  {bot.vip ? 'Downgrade' : 'Upgrade'}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => kickUser(bot.id)}
                                >
                                  Kick
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Reports & Feedback</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Total Reports</h3>
                <p className="text-3xl font-bold">
                  {reportsFeedback.filter(item => item.type === 'report').length}
                </p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Pending Resolution</h3>
                <p className="text-3xl font-bold">
                  {reportsFeedback.filter(item => !item.resolved).length}
                </p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Feedback Items</h3>
                <p className="text-3xl font-bold">
                  {reportsFeedback.filter(item => item.type === 'feedback').length}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Reports & Feedback</h3>
              <div className="rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">User ID</th>
                        <th className="px-4 py-3 font-medium">Content</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsFeedback.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                            No reports or feedback found
                          </td>
                        </tr>
                      ) : (
                        reportsFeedback.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.type === 'report' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {item.type === 'report' ? 'Report' : 'Feedback'}
                              </span>
                            </td>
                            <td className="px-4 py-3">{item.userId}</td>
                            <td className="max-w-xs truncate px-4 py-3">{item.content}</td>
                            <td className="px-4 py-3">{new Date(item.timestamp).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.resolved 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}>
                                {item.resolved ? 'Resolved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                {!item.resolved && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => resolveReportFeedback(item.id)}
                                  >
                                    Resolve
                                  </Button>
                                )}
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteReportFeedback(item.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bans">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Bans & Admin Actions</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Active Bans</h3>
                <p className="text-3xl font-bold">{bannedUsers.length}</p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Admin Actions</h3>
                <p className="text-3xl font-bold">{adminActions.length}</p>
              </div>
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-medium">Recent Actions</h3>
                <p className="text-3xl font-bold">
                  {adminActions.filter(action => 
                    new Date(action.timestamp).getTime() > Date.now() - 86400000 // last 24 hours
                  ).length}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Banned Users</h3>
              <div className="rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 font-medium">Identifier</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                        <th className="px-4 py-3 font-medium">Duration</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                            No banned users found
                          </td>
                        </tr>
                      ) : (
                        bannedUsers.map((ban) => (
                          <tr key={ban.id} className="border-b">
                            <td className="px-4 py-3">{ban.identifier}</td>
                            <td className="px-4 py-3">{ban.identifierType}</td>
                            <td className="max-w-xs truncate px-4 py-3">{ban.reason}</td>
                            <td className="px-4 py-3">{ban.duration}</td>
                            <td className="px-4 py-3">{new Date(ban.timestamp).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => unbanUser(ban.id)}
                              >
                                Unban
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Admin Actions Log</h3>
              <div className="rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 font-medium">Action Type</th>
                        <th className="px-4 py-3 font-medium">Target ID</th>
                        <th className="px-4 py-3 font-medium">Target Type</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminActions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                            No admin actions found
                          </td>
                        </tr>
                      ) : (
                        adminActions.map((action) => (
                          <tr key={action.id} className="border-b">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                action.actionType === 'ban' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                  : action.actionType === 'kick' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : action.actionType === 'upgrade'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {action.actionType}
                              </span>
                            </td>
                            <td className="px-4 py-3">{action.targetId}</td>
                            <td className="px-4 py-3">{action.targetType}</td>
                            <td className="max-w-xs truncate px-4 py-3">{action.reason || 'N/A'}</td>
                            <td className="px-4 py-3">{new Date(action.timestamp).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Admin Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Change Admin Password</h3>
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="current-password" className="text-sm font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="new-password" className="text-sm font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      className="h-4 w-4 rounded border"
                    />
                    <label htmlFor="email-notifications" className="text-sm font-medium">
                      Receive email notifications for new reports
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-delete"
                      className="h-4 w-4 rounded border"
                    />
                    <label htmlFor="auto-delete" className="text-sm font-medium">
                      Auto-delete resolved reports after 7 days
                    </label>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <AdminStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
