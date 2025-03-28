
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Activity, 
  Users, 
  Globe, 
  Server
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { countries } from '@/data/countries';

// Mock traffic data by country for demonstration
const mockTrafficData = countries.map(country => ({
  country: country.name,
  visits: Math.floor(Math.random() * 10000),
  users: Math.floor(Math.random() * 2000),
  bounceRate: Math.floor(Math.random() * 100),
  avgSessionTime: Math.floor(Math.random() * 500)
}));

// Mock activity data for timeline chart
const mockActivityData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  logins: Math.floor(Math.random() * 500),
  messages: Math.floor(Math.random() * 2000),
  reports: Math.floor(Math.random() * 50)
}));

// Top content statistics
const mockContentStats = [
  { type: 'Messages', count: 245789, growth: 12.5 },
  { type: 'Media Shared', count: 58943, growth: 8.2 },
  { type: 'User Reports', count: 1254, growth: -2.8 },
  { type: 'Feedback Submissions', count: 3827, growth: 15.1 }
];

// System performance metrics
const mockPerformanceMetrics = {
  cpuUsage: 42,
  memoryUsage: 68,
  diskUsage: 37,
  networkLatency: 120, // ms
  activeConnections: 1258,
  failedRequests: 23
};

export const StatisticsMenu = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Last 30 days');

  // Filter data based on selected country
  const filteredTrafficData = useMemo(() => {
    if (selectedCountry === 'All Countries') {
      return mockTrafficData;
    }
    return mockTrafficData.filter(data => data.country === selectedCountry);
  }, [selectedCountry]);

  // Calculate totals for summary
  const trafficSummary = useMemo(() => {
    if (selectedCountry === 'All Countries') {
      return {
        totalVisits: mockTrafficData.reduce((sum, item) => sum + item.visits, 0),
        totalUsers: mockTrafficData.reduce((sum, item) => sum + item.users, 0),
        avgBounceRate: Math.round(mockTrafficData.reduce((sum, item) => sum + item.bounceRate, 0) / mockTrafficData.length),
        avgSessionTime: Math.round(mockTrafficData.reduce((sum, item) => sum + item.avgSessionTime, 0) / mockTrafficData.length)
      };
    } else {
      const countryData = mockTrafficData.find(data => data.country === selectedCountry);
      return countryData ? {
        totalVisits: countryData.visits,
        totalUsers: countryData.users,
        avgBounceRate: countryData.bounceRate,
        avgSessionTime: countryData.avgSessionTime
      } : {
        totalVisits: 0,
        totalUsers: 0,
        avgBounceRate: 0,
        avgSessionTime: 0
      };
    }
  }, [selectedCountry]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Last 7 days">Last 7 days</SelectItem>
              <SelectItem value="Last 30 days">Last 30 days</SelectItem>
              <SelectItem value="Last 90 days">Last 90 days</SelectItem>
              <SelectItem value="This year">This year</SelectItem>
              <SelectItem value="All time">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Traffic</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>User Activity</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Content Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Traffic Statistics</h3>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Countries">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trafficSummary.totalVisits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trafficSummary.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +15.3% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trafficSummary.avgBounceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  -2.5% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trafficSummary.avgSessionTime}s</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Traffic by Country</CardTitle>
              <CardDescription>
                Showing top {Math.min(filteredTrafficData.length, 10)} countries by traffic volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTrafficData
                  .sort((a, b) => b.visits - a.visits)
                  .slice(0, 10)
                  .map((countryData) => (
                    <div key={countryData.country} className="flex items-center">
                      <div className="w-[200px] flex items-center">
                        <span className="mr-2">
                          {countries.find(c => c.name === countryData.country)?.flag}
                        </span>
                        <span className="font-medium">{countryData.country}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Progress
                            value={(countryData.visits / trafficSummary.totalVisits) * 100}
                            className="h-2 flex-1"
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            {countryData.visits.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Trends</CardTitle>
              <CardDescription>
                Daily traffic for {selectedPeriod.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  data={mockActivityData}
                  xAxisKey="date"
                  yAxisKey="logins"
                  tooltip={
                    <ChartTooltip content={<ChartTooltipContent formatValues={(v) => `${v}`} />} />
                  }
                >
                  <Chart
                    type="bar"
                    dataKey="logins"
                    name="User Logins"
                    className="fill-primary"
                  />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="activity" className="space-y-4 pt-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,453</div>
                <p className="text-xs text-muted-foreground">
                  +5.1% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245,789</div>
                <p className="text-xs text-muted-foreground">
                  +18.3% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Sign-ups</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,845</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Retention</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76.3%</div>
                <p className="text-xs text-muted-foreground">
                  +2.2% from last {selectedPeriod.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>
                User activity over {selectedPeriod.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  data={mockActivityData}
                  xAxisKey="date"
                  tooltip={
                    <ChartTooltip content={<ChartTooltipContent formatValues={(v) => `${v}`} />} />
                  }
                >
                  <Chart
                    type="line"
                    dataKey="logins"
                    name="Logins"
                    className="stroke-blue-500 fill-blue-500/20"
                  />
                  <Chart
                    type="line"
                    dataKey="messages"
                    name="Messages"
                    className="stroke-green-500 fill-green-500/20"
                  />
                  <Chart
                    type="line"
                    dataKey="reports"
                    name="Reports"
                    className="stroke-red-500 fill-red-500/20"
                  />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Metrics Tab */}
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="grid grid-cols-4 gap-4">
            {mockContentStats.map((stat) => (
              <Card key={stat.type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.type}</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count.toLocaleString()}</div>
                  <p className={`text-xs ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.growth >= 0 ? '+' : ''}{stat.growth}% from last {selectedPeriod.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Distribution</CardTitle>
              <CardDescription>
                Types of content shared on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  data={[
                    { name: 'Text', value: 65 },
                    { name: 'Images', value: 25 },
                    { name: 'Voice', value: 8 },
                    { name: 'Other', value: 2 }
                  ]}
                  xAxisKey="name"
                  yAxisKey="value"
                  tooltip={
                    <ChartTooltip content={<ChartTooltipContent formatValues={(v) => `${v}%`} />} />
                  }
                >
                  <Chart
                    type="pie"
                    dataKey="value"
                    nameKey="name"
                    className="stroke-background stroke-2"
                  />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Current system resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">CPU Usage</div>
                    <div className="text-sm text-muted-foreground">{mockPerformanceMetrics.cpuUsage}%</div>
                  </div>
                  <Progress value={mockPerformanceMetrics.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Memory Usage</div>
                    <div className="text-sm text-muted-foreground">{mockPerformanceMetrics.memoryUsage}%</div>
                  </div>
                  <Progress value={mockPerformanceMetrics.memoryUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Disk Usage</div>
                    <div className="text-sm text-muted-foreground">{mockPerformanceMetrics.diskUsage}%</div>
                  </div>
                  <Progress value={mockPerformanceMetrics.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Metrics</CardTitle>
                <CardDescription>
                  Active connections and request status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">Active Connections</div>
                  </div>
                  <div className="font-medium">{mockPerformanceMetrics.activeConnections}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">Network Latency</div>
                  </div>
                  <div className="font-medium">{mockPerformanceMetrics.networkLatency}ms</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">Failed Requests</div>
                  </div>
                  <div className="font-medium">{mockPerformanceMetrics.failedRequests}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                Performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  data={Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i}:00`,
                    latency: Math.floor(Math.random() * 200) + 50,
                    cpu: Math.floor(Math.random() * 60) + 20,
                  }))}
                  xAxisKey="hour"
                  tooltip={
                    <ChartTooltip content={<ChartTooltipContent formatValues={(v) => `${v}`} />} />
                  }
                >
                  <Chart
                    type="line"
                    dataKey="latency"
                    name="Latency (ms)"
                    className="stroke-blue-500 fill-blue-500/20"
                  />
                  <Chart
                    type="line"
                    dataKey="cpu"
                    name="CPU (%)"
                    className="stroke-orange-500 fill-orange-500/20"
                  />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsMenu;
