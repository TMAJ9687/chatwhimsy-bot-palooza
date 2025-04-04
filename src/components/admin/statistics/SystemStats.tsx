
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRandomLineData } from '@/utils/chartUtils';
import { StatisticTimeRange } from '@/utils/adminUtils';
import { 
  ChartWrapper, 
  Line, 
  Area,
  CartesianGrid, 
  XAxis, 
  YAxis,
  Tooltip,
  Legend
} from '@/components/ui/ChartWrapper';

// Define props interface
interface SystemStatsProps {
  timeRange: StatisticTimeRange;
}

// Sample data for system stats
const timePoints = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
const serverData = generateRandomLineData(timePoints, ['cpu', 'memory', 'network'], 10, 90);

const errorData = [
  { time: '00:00', errors: 2 },
  { time: '04:00', errors: 5 },
  { time: '08:00', errors: 12 },
  { time: '12:00', errors: 8 },
  { time: '16:00', errors: 6 },
  { time: '20:00', errors: 10 },
];

const responseTimeData = generateRandomLineData(
  ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
  ['responseTime'],
  50,
  300
);

const SystemStats: React.FC<SystemStatsProps> = ({ timeRange }) => {
  // You can use timeRange to filter or adjust data as needed
  console.log(`SystemStats timeRange: ${timeRange}`);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Server Status</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <div className="text-lg font-medium">Operational</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">99.98% uptime this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average API response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">124ms</div>
            <div className="text-sm text-muted-foreground mt-1">-15ms from last week</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>System errors per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0.05%</div>
            <div className="text-sm text-muted-foreground mt-1">-0.02% from yesterday</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Server Resources</CardTitle>
            <CardDescription>CPU, Memory and Network usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartWrapper type="line" data={serverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  name="CPU"
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  name="Memory"
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="network" 
                  name="Network"
                  stroke="#ffc658" 
                  strokeWidth={2}
                />
              </ChartWrapper>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Errors</CardTitle>
            <CardDescription>Error count by time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartWrapper type="area" data={errorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  name="Errors"
                  stroke="#ff7300" 
                  fill="#ff7300" 
                  fillOpacity={0.3}
                />
              </ChartWrapper>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Response Time Trend</CardTitle>
          <CardDescription>Average API response time over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartWrapper type="line" data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="ms" />
              <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                name="Response Time"
                stroke="#8884d8" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </ChartWrapper>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStats;
