
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
  Legend,
  Cell
} from "recharts";

const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ff9833',
];

interface ContentStatsProps {
  contentStats: any;
  formatNumber: (num: number) => string;
  getPercentChange: () => string;
}

const ContentStats: React.FC<ContentStatsProps> = ({ 
  contentStats, 
  formatNumber, 
  getPercentChange 
}) => {
  return (
    <TabsContent value="content">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(contentStats.totalMessages)}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(contentStats.totalUploads)}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Messages/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.averageMessagesPerUser}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentChange()} from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages by Type</CardTitle>
            <CardDescription>Messages per day over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentStats.messagesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="standard" fill="#8884d8" name="Standard Users" />
                  <Bar dataKey="vip" fill="#82ca9d" name="VIP Users" />
                  <Bar dataKey="bot" fill="#ffc658" name="Bot Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Media Uploads</CardTitle>
            <CardDescription>Media uploads per day over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={contentStats.uploadsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="images" stroke="#8884d8" name="Images" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="videos" stroke="#82ca9d" name="Videos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bot Interactions</CardTitle>
          <CardDescription>Most popular bots by interaction count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={contentStats.botInteractions.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="botName" type="category" />
                <Tooltip />
                <Bar dataKey="interactions" fill="#8884d8">
                  {contentStats.botInteractions.slice(0, 10).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ContentStats;
