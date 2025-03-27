
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Ban, MessageSquare, BadgeAlert, ThumbsUp } from 'lucide-react';
import { adminService } from '@/services/admin/AdminService';

const AdminDashboard: React.FC = () => {
  const vipUsers = adminService.getVipUsers();
  const standardUsers = adminService.getStandardUsers();
  const bannedUsers = adminService.getBannedUsers();
  const reports = adminService.getReports();
  const feedback = adminService.getFeedback();
  
  const onlineVipCount = vipUsers.filter(user => user.online).length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const newFeedbackCount = feedback.filter(f => f.status === 'new').length;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total VIP Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vipUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {onlineVipCount} online now
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Standard Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{standardUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active on the platform
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bannedUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Total banned accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <BadgeAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReportsCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newFeedbackCount}</div>
              <p className="text-xs text-muted-foreground">
                Unread user feedback
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,842</div>
              <p className="text-xs text-muted-foreground">
                In the last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Latest user reports submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.slice(0, 3).map(report => (
                  <div key={report.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{report.reportedUsername}</p>
                        <p className="text-sm text-muted-foreground">{report.reason}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest feedback from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feedback.slice(0, 3).map(item => (
                  <div key={item.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.username || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{item.content.substring(0, 50)}...</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
