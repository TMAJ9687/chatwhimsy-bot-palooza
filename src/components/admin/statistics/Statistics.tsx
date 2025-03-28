
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart, Database, Users } from "lucide-react";
import TrafficStats from './TrafficStats';
import UserStats from './UserStats';
import ContentStats from './ContentStats';
import SystemStats from './SystemStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatisticTimeRange, getSampleStatistics } from '@/utils/adminUtils';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('traffic');
  const [timeRange, setTimeRange] = useState<StatisticTimeRange>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(getSampleStatistics('month'));

  // Update stats when time range changes
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setStats(getSampleStatistics(timeRange));
        setIsLoading(false);
      }, 500);
    };
    
    fetchStats();
  }, [timeRange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Statistics Dashboard</h2>
          <p className="text-muted-foreground">
            View and analyze key performance metrics for your platform
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            className="p-2 rounded border bg-background"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as StatisticTimeRange)}
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.values(stats).map((stat) => (
          <Card key={stat.name} className={isLoading ? "opacity-70" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              {stat.change !== undefined && (
                <p className={`text-xs flex items-center mt-1 ${
                  stat.changeDirection === 'up' ? 'text-green-500' : 
                  stat.changeDirection === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {stat.changeDirection === 'up' && '↑'}
                  {stat.changeDirection === 'down' && '↓'}
                  {stat.change}% from previous {timeRange}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="traffic" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Traffic</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden md:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">System</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="traffic" className="mt-6">
          <TrafficStats timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <UserStats timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <ContentStats timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemStats timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
