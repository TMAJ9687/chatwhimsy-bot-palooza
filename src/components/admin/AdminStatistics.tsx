
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from 'recharts';
import { formatDate } from '@/utils/adminUtils';

// Mock data for statistics
const trafficData = [
  { date: '2023-06-01', visitors: 1240, newUsers: 540, sessions: 1800 },
  { date: '2023-07-01', visitors: 1580, newUsers: 620, sessions: 2100 },
  { date: '2023-08-01', visitors: 1890, newUsers: 710, sessions: 2400 },
  { date: '2023-09-01', visitors: 2190, newUsers: 820, sessions: 2800 },
  { date: '2023-10-01', visitors: 2490, newUsers: 940, sessions: 3300 },
  { date: '2023-11-01', visitors: 2780, newUsers: 1020, sessions: 3700 }
];

const userActivityData = [
  { date: '2023-06-01', activeUsers: 820, messagesSent: 5400, actionsPerformed: 12800 },
  { date: '2023-07-01', activeUsers: 950, messagesSent: 6200, actionsPerformed: 14200 },
  { date: '2023-08-01', activeUsers: 1030, messagesSent: 7100, actionsPerformed: 15600 },
  { date: '2023-09-01', activeUsers: 1240, messagesSent: 8400, actionsPerformed: 17800 },
  { date: '2023-10-01', activeUsers: 1380, messagesSent: 9200, actionsPerformed: 19400 },
  { date: '2023-11-01', activeUsers: 1520, messagesSent: 10100, actionsPerformed: 21500 }
];

const contentDistributionData = [
  { name: 'Text Messages', value: 55 },
  { name: 'Images Shared', value: 25 },
  { name: 'Voice Messages', value: 15 },
  { name: 'Other Content', value: 5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const performanceData = [
  { date: '2023-06-01', responseTime: 280, errorRate: 1.2, serverLoad: 42 },
  { date: '2023-07-01', responseTime: 320, errorRate: 1.5, serverLoad: 48 },
  { date: '2023-08-01', responseTime: 290, errorRate: 1.0, serverLoad: 53 },
  { date: '2023-09-01', responseTime: 350, errorRate: 1.7, serverLoad: 58 },
  { date: '2023-10-01', responseTime: 310, errorRate: 1.3, serverLoad: 62 },
  { date: '2023-11-01', responseTime: 280, errorRate: 0.9, serverLoad: 55 }
];

const AdminStatistics = () => {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="space-y-4">
      <Tabs defaultValue="traffic" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer
                  config={{
                    visitors: {
                      label: "Visitors",
                      color: "#4f46e5",
                    },
                    newUsers: {
                      label: "New Users",
                      color: "#8b5cf6",
                    },
                    sessions: {
                      label: "Sessions",
                      color: "#a78bfa",
                    },
                  }}
                >
                  <BarChart data={trafficData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Date:</div>
                                <div>
                                  {new Date(payload[0].payload.date).toLocaleDateString()}
                                </div>
                                {payload.map((entry) => (
                                  <React.Fragment key={entry.name}>
                                    <div className="font-medium">{entry.name}:</div>
                                    <div>{entry.value.toLocaleString()}</div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="visitors"
                      name="Visitors"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="newUsers"
                      name="New Users"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sessions"
                      name="Sessions"
                      fill="#a78bfa"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer
                  config={{
                    activeUsers: {
                      label: "Active Users",
                      color: "#0ea5e9",
                    },
                    messagesSent: {
                      label: "Messages Sent",
                      color: "#22d3ee",
                    },
                    actionsPerformed: {
                      label: "Actions Performed",
                      color: "#67e8f9",
                    },
                  }}
                >
                  <LineChart data={userActivityData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Date:</div>
                                <div>
                                  {new Date(payload[0].payload.date).toLocaleDateString()}
                                </div>
                                {payload.map((entry) => (
                                  <React.Fragment key={entry.name}>
                                    <div className="font-medium">{entry.name}:</div>
                                    <div>{entry.value.toLocaleString()}</div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="messagesSent"
                      name="Messages Sent"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full flex items-center justify-center">
                <ChartContainer
                  config={{
                    contentDistribution: {
                      label: "Content Types",
                      color: "#0ea5e9",
                    }
                  }}
                >
                  <PieChart width={400} height={300}>
                    <Pie
                      data={contentDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {contentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Type:</div>
                                <div>
                                  {payload[0].payload.name}
                                </div>
                                <div className="font-medium">Percentage:</div>
                                <div>{payload[0].payload.value}%</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer
                  config={{
                    responseTime: {
                      label: "Response Time (ms)",
                      color: "#f97316",
                    },
                    errorRate: {
                      label: "Error Rate (%)",
                      color: "#ef4444",
                    },
                    serverLoad: {
                      label: "Server Load (%)",
                      color: "#f59e0b",
                    },
                  }}
                >
                  <LineChart data={performanceData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Date:</div>
                                <div>
                                  {new Date(payload[0].payload.date).toLocaleDateString()}
                                </div>
                                {payload.map((entry) => (
                                  <React.Fragment key={entry.name}>
                                    <div className="font-medium">{entry.name}:</div>
                                    <div>{entry.value.toLocaleString()}</div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      name="Response Time (ms)"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errorRate"
                      name="Error Rate (%)"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="serverLoad"
                      name="Server Load (%)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStatistics;
