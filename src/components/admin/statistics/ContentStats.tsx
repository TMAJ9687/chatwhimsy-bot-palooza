
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLargeNumber } from '@/utils/chartUtils';

// Sample data for content stats
const messageActivityData = [
  { day: 'Mon', messages: 2500 },
  { day: 'Tue', messages: 3100 },
  { day: 'Wed', messages: 4000 },
  { day: 'Thu', messages: 3800 },
  { day: 'Fri', messages: 5200 },
  { day: 'Sat', messages: 6100 },
  { day: 'Sun', messages: 4800 },
];

const contentTypeData = [
  { name: 'Text', value: 60 },
  { name: 'Images', value: 25 },
  { name: 'Voice', value: 10 },
  { name: 'Files', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ContentStats = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Messages</CardTitle>
            <CardDescription>All time message count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.5M</div>
            <div className="text-sm text-muted-foreground mt-1">+18% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Media Uploads</CardTitle>
            <CardDescription>Images, voice messages, files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.8M</div>
            <div className="text-sm text-muted-foreground mt-1">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Storage Used</CardTitle>
            <CardDescription>Total server storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">256 GB</div>
            <div className="text-sm text-muted-foreground mt-1">+5% from last month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>Messages sent by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={messageActivityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={formatLargeNumber} />
                  <Tooltip formatter={(value) => [formatLargeNumber(value as number), 'Messages']} />
                  <Bar dataKey="messages" fill="#8884d8" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Content Type Distribution</CardTitle>
            <CardDescription>Breakdown by message type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Message Times</CardTitle>
          <CardDescription>When users are most active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { hour: '12am', messages: 300 },
                  { hour: '3am', messages: 150 },
                  { hour: '6am', messages: 200 },
                  { hour: '9am', messages: 800 },
                  { hour: '12pm', messages: 1500 },
                  { hour: '3pm', messages: 2000 },
                  { hour: '6pm', messages: 2500 },
                  { hour: '9pm', messages: 1800 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis tickFormatter={formatLargeNumber} />
                <Tooltip formatter={(value) => [formatLargeNumber(value as number), 'Messages']} />
                <Bar dataKey="messages" fill="#82ca9d" name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentStats;
