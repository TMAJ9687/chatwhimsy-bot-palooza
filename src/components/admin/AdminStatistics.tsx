
import React from 'react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Card } from '@/components/ui/card';
import { StatisticsMenu } from '@/components/admin/StatisticsMenu';

export const AdminStatistics = () => {
  // Verify admin authentication
  const { isAuthenticated, user } = useAdminSession('/admin-login');

  if (!isAuthenticated) {
    return null; // Protected route - will redirect via useAdminSession hook
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Statistics</h1>
      
      <Card className="p-6">
        <StatisticsMenu />
      </Card>
    </div>
  );
};

export default AdminStatistics;
