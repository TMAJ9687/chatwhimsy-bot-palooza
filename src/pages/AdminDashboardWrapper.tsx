
import React from 'react';
import { AdminProvider } from '@/context/AdminContext';
import AdminDashboard from './AdminDashboard';

/**
 * Wrapper component that provides the AdminContext to the AdminDashboard
 */
const AdminDashboardWrapper: React.FC = () => {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
};

export default AdminDashboardWrapper;
