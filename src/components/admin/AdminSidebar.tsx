
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Settings, LogOut, CircleUser, ChevronDown, BarChart as BarChartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/admin/login");
  };

  return (
    <div className="w-64 border-r border-r-slate-200 dark:border-r-slate-700 bg-white dark:bg-slate-800 flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage users, settings, and more.
        </p>
      </div>

      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="flex flex-col space-y-2">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 flex items-center text-sm rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 flex items-center text-sm rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
              <BarChartIcon className="mr-2 h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 flex items-center text-sm rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 border-t border-t-slate-200 dark:border-t-slate-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <CircleUser className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => alert("Profile clicked")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminSidebar;
