
import React from 'react';
import { User, LogOut, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/useLogout';

interface DashboardHeaderProps {
  email?: string;
  handleRetry: () => void;
  toggleChat?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  email, 
  handleRetry,
  toggleChat 
}) => {
  const { performLogout } = useLogout();
  
  const handleLogout = async () => {
    await performLogout();
  };
  
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        {toggleChat && (
          <Button onClick={toggleChat} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Open Chat</span>
          </Button>
        )}
        
        <Button variant="outline" size="icon" onClick={handleRetry} title="Refresh Data">
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {email?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>Admin Account</span>
              {email && <span className="text-xs text-muted-foreground">{email}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex cursor-pointer items-center text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardHeader;
