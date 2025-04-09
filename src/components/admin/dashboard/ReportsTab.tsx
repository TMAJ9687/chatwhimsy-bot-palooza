
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MessageSquare, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { ReportFeedback } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';

const ReportsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const { reportsFeedback, loadReportsAndFeedback, resolveReportFeedback, deleteReportFeedback } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Filter by type
  const reports = reportsFeedback.filter(item => item.type === 'report');
  const feedback = reportsFeedback.filter(item => item.type === 'feedback');
  
  // Load all reports and feedback
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadReportsAndFeedback();
      setLoading(false);
    };
    
    fetchData();
  }, [loadReportsAndFeedback]);
  
  // Resolve report or feedback
  const handleResolve = async (id: string, type: string) => {
    const success = await resolveReportFeedback(id);
    if (success) {
      toast({
        title: `${type === 'report' ? 'Report' : 'Feedback'} Resolved`,
        description: `The ${type} has been marked as resolved`
      });
    }
  };
  
  // Delete report or feedback
  const handleDelete = async (id: string, type: string) => {
    const success = await deleteReportFeedback(id);
    if (success) {
      toast({
        title: `${type === 'report' ? 'Report' : 'Feedback'} Deleted`,
        description: `The ${type} has been deleted`
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Feedback</CardTitle>
        <CardDescription>
          Review user-submitted reports and feedback to improve the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="reports" className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              User Reports
              {reports.filter(report => !report.resolved).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {reports.filter(report => !report.resolved).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              User Feedback
              {feedback.filter(item => !item.resolved).length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {feedback.filter(item => !item.resolved).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadReportsAndFeedback()}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            {reports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.userId}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{report.content}</TableCell>
                      <TableCell>{formatDistanceToNow(report.timestamp, { addSuffix: true })}</TableCell>
                      <TableCell>
                        {report.resolved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(report.expiresAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          {!report.resolved && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolve(report.id, 'report')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(report.id, 'report')}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {loading ? 'Loading reports...' : 'No reports available'}
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadReportsAndFeedback()}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            {feedback.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.userId}</TableCell>
                      <TableCell className="max-w-[400px] truncate">{item.content}</TableCell>
                      <TableCell>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</TableCell>
                      <TableCell>
                        {item.resolved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          {!item.resolved && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolve(item.id, 'feedback')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(item.id, 'feedback')}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {loading ? 'Loading feedback...' : 'No feedback available'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
