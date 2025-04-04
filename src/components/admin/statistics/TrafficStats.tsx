
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateRandomLineData, formatLargeNumber } from '@/utils/chartUtils';
import { StatisticTimeRange } from '@/utils/adminUtils';
import { 
  ChartWrapper, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Bar,
  Legend
} from '@/components/ui/ChartWrapper';

// Define props interface
interface TrafficStatsProps {
  timeRange: StatisticTimeRange;
}

// Sample data for the traffic stats
const timePoints = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const visitData = generateRandomLineData(timePoints, ['pageViews', 'uniqueVisitors'], 500, 3000);

const bounceRateData = [
  { name: 'Home', value: 25 },
  { name: 'Chat', value: 15 },
  { name: 'Profile', value: 35 },
  { name: 'Settings', value: 30 },
  { name: 'VIP', value: 10 },
];

const TrafficStats: React.FC<TrafficStatsProps> = ({ timeRange }) => {
  // You can use timeRange to filter or adjust data as needed
  console.log(`TrafficStats timeRange: ${timeRange}`);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Site Traffic</CardTitle>
            <CardDescription>Daily page views and unique visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartWrapper type="area" data={visitData}>
                <defs>
                  <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatLargeNumber} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="pageViews" 
                  name="Page Views"
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorPageViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="uniqueVisitors" 
                  name="Unique Visitors"
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorUniqueVisitors)" 
                />
              </ChartWrapper>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Bounce Rate by Page</CardTitle>
            <CardDescription>Percentage of visitors leaving after viewing only one page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartWrapper type="bar" data={bounceRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Bounce Rate']} />
                <Bar dataKey="value" fill="#8884d8" name="Bounce Rate" />
              </ChartWrapper>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Where your visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="h-[300px] pt-4">
              <ChartWrapper
                type="bar"
                data={[
                  { name: 'Direct', value: 45 },
                  { name: 'Search', value: 25 },
                  { name: 'Social', value: 15 },
                  { name: 'Referral', value: 10 },
                  { name: 'Email', value: 5 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="value" fill="#82ca9d" />
              </ChartWrapper>
            </TabsContent>
            <TabsContent value="referrers" className="h-[300px] pt-4">
              <ChartWrapper
                type="bar"
                data={[
                  { name: 'Google', value: 60 },
                  { name: 'Bing', value: 15 },
                  { name: 'Yahoo', value: 10 },
                  { name: 'DuckDuckGo', value: 8 },
                  { name: 'Other', value: 7 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="value" fill="#8884d8" />
              </ChartWrapper>
            </TabsContent>
            <TabsContent value="social" className="h-[300px] pt-4">
              <ChartWrapper
                type="bar"
                data={[
                  { name: 'Facebook', value: 40 },
                  { name: 'Twitter', value: 30 },
                  { name: 'Instagram', value: 15 },
                  { name: 'LinkedIn', value: 10 },
                  { name: 'Other', value: 5 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="value" fill="#6366f1" />
              </ChartWrapper>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficStats;
