
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
        >
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Total users: 2,546</p>
            <Button className="w-full">Manage Users</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Update site content and assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Last updated: 3 days ago</p>
            <Button className="w-full">Edit Content</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View site performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Active sessions: 132</p>
            <Button className="w-full">View Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
