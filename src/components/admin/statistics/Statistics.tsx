
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart, Database, Users } from "lucide-react";
import TrafficStats from './TrafficStats';
import UserStats from './UserStats';
import ContentStats from './ContentStats';
import SystemStats from './SystemStats';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Statistics Dashboard</h2>
      <p className="text-muted-foreground">
        View and analyze key performance metrics for your platform
      </p>
      
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
          <TrafficStats />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <UserStats />
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <ContentStats />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
