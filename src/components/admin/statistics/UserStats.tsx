
import React from 'react';
import { 
  LineChart, 
  Line, 
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
import { generateRandomLineData, formatLargeNumber } from '@/utils/chartUtils';
import { StatisticTimeRange } from '@/utils/adminUtils';

// Define props interface
interface UserStatsProps {
  timeRange: StatisticTimeRange;
}

// Sample data for user stats
const timePoints = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const userData = generateRandomLineData(timePoints, ['newUsers', 'activeUsers'], 500, 3000);

const userTypes = [
  { name: 'Free Users', value: 6500 },
  { name: 'Premium', value: 1500 },
  { name: 'Trial', value: 500 },
  { name: 'Enterprise', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UserStats: React.FC<UserStatsProps> = ({ timeRange }) => {
  // You can use timeRange to filter or adjust data as needed
  console.log(`UserStats timeRange: ${timeRange}`);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,700</div>
            <div className="text-sm text-muted-foreground mt-1">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Active in last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6,240</div>
            <div className="text-sm text-muted-foreground mt-1">+8% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Free to premium users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18.7%</div>
            <div className="text-sm text-muted-foreground mt-1">+2.3% from last month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatLargeNumber} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    name="New Users"
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users"
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatLargeNumber(value as number), 'Users']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Retention</CardTitle>
          <CardDescription>How many users continue to use the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Month 1', retention: 100 },
                  { month: 'Month 2', retention: 85 },
                  { month: 'Month 3', retention: 70 },
                  { month: 'Month 4', retention: 62 },
                  { month: 'Month 5', retention: 56 },
                  { month: 'Month 6', retention: 52 },
                  { month: 'Month 7', retention: 48 },
                  { month: 'Month 8', retention: 45 },
                  { month: 'Month 9', retention: 42 },
                  { month: 'Month 10', retention: 40 },
                  { month: 'Month 11', retention: 38 },
                  { month: 'Month 12', retention: 36 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  name="Retention Rate"
                  stroke="#ff7300" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
