
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Star, User, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  id: 'admin' | 'vip' | 'regular' | 'guest';
  label: string;
  icon: React.ReactNode;
  color: string;
  buttonClass: string;
}

interface UserManagementProps {
  isMockMode: boolean;
  onSwitchRole?: (role: 'admin' | 'vip' | 'regular' | 'guest') => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ isMockMode, onSwitchRole }) => {
  const { toast } = useToast();
  
  const userRoles: UserRole[] = [
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield size={16} />,
      color: 'text-red-800',
      buttonClass: 'bg-red-100 hover:bg-red-200 text-red-800'
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: <Star size={16} />,
      color: 'text-purple-800',
      buttonClass: 'bg-purple-100 hover:bg-purple-200 text-purple-800'
    },
    {
      id: 'regular',
      label: 'Regular',
      icon: <User size={16} />,
      color: 'text-blue-800',
      buttonClass: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
    },
    {
      id: 'guest',
      label: 'Guest',
      icon: <UserX size={16} />,
      color: 'text-gray-800',
      buttonClass: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
    }
  ];
  
  const handleRoleSwitch = (role: 'admin' | 'vip' | 'regular' | 'guest') => {
    if (onSwitchRole) {
      onSwitchRole(role);
    } else {
      toast({
        title: 'Feature Not Available',
        description: 'User role switching is only available in mock mode.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage user accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isMockMode ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You are in mock mode. You can switch between different user roles for testing.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {userRoles.map(role => (
                <Button 
                  key={role.id}
                  variant="outline" 
                  className={role.buttonClass}
                  onClick={() => handleRoleSwitch(role.id)}
                >
                  <span className="mr-2">{role.icon}</span>
                  Switch to {role.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Real user management features will be implemented here.
            </p>
            
            <div className="border rounded-md">
              <div className="p-4 border-b bg-muted/50">
                <h3 className="font-medium">Users</h3>
              </div>
              <div className="p-4 text-center text-muted-foreground">
                No users to display. User data will be loaded here.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
