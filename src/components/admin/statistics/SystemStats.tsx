
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface SystemStatsProps {
  systemStats: any;
  formatNumber: (num: number) => string;
  getPercentChange: () => string;
}

const SystemStats: React.FC<SystemStatsProps> = ({ 
  systemStats, 
  formatNumber, 
  getPercentChange 
}) => {
  return (
    <TabsContent value="system">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.resourceUsage?.find((r: any) => r.name === 'CPU')?.value || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.resourceUsage?.find((r: any) => r.name === 'Memory')?.value || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.resourceUsage?.find((r: any) => r.name === 'Disk')?.value || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Server Performance</CardTitle>
            <CardDescription>Resource usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemStats.serverResponse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#8884d8" name="Response Time" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Response Times</CardTitle>
            <CardDescription>Average response time per endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={systemStats.serverResponse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="responseTime" fill="#8884d8" name="Response Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Error Rates</CardTitle>
          <CardDescription>Server errors over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemStats.errorRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="errors" stroke="#ff0000" name="Errors" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="requests" stroke="#ffaa00" name="Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SystemStats;
