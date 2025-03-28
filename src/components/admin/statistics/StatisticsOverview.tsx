
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrafficStats from './TrafficStats';
import UserStats from './UserStats';
import ContentStats from './ContentStats';
import SystemStats from './SystemStats';

interface StatisticsOverviewProps {
  statsTab: string;
  setStatsTab: (tab: string) => void;
  trafficStats: any;
  userStats: any;
  contentStats: any;
  systemStats: any;
  formatNumber: (num: number) => string;
  getPercentChange: () => string;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  statsTab,
  setStatsTab,
  trafficStats,
  userStats,
  contentStats,
  systemStats,
  formatNumber,
  getPercentChange
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Statistics Dashboard</h2>
      </div>
      
      <Tabs value={statsTab} onValueChange={setStatsTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TrafficStats 
          trafficStats={trafficStats} 
          formatNumber={formatNumber} 
          getPercentChange={getPercentChange} 
        />
        
        <UserStats 
          userStats={userStats} 
          formatNumber={formatNumber} 
          getPercentChange={getPercentChange} 
        />
        
        <ContentStats 
          contentStats={contentStats} 
          formatNumber={formatNumber} 
          getPercentChange={getPercentChange} 
        />
        
        <SystemStats 
          systemStats={systemStats} 
          formatNumber={formatNumber} 
          getPercentChange={getPercentChange} 
        />
      </Tabs>
    </div>
  );
};

export default StatisticsOverview;
