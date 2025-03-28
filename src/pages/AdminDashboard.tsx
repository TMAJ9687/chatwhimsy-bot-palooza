
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"; // Added Label import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Settings, MessageSquare, LogOut, Ban, Edit, Trash2, Plus, Search, Bell, Mail, FileText, FileSearch, Shield, ShieldOff, CircleUser, CircleCheck, CircleX, ArrowRight, ArrowLeft, ChevronDown, CheckCircle2, XCircle, Clock, BarChart as BarChartIcon } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { VipDuration } from '@/types/admin';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";
import { 
  getTrafficStatistics, 
  getUserStatistics, 
  getContentStatistics, 
  getSystemStatistics 
} from '@/utils/adminUtils';

// Form validation schema for banning a user
const banUserSchema = z.object({
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
  duration: z.enum(['1 Day', '3 Days', '7 Days', '30 Days', 'Permanent']),
});

// Form validation schema for upgrading a user to VIP
const upgradeToVIPSchema = z.object({
  duration: z.enum(['1 Day', '1 Week', '1 Month', '1 Year', 'Lifetime']),
});

const CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#a4de6c',
  '#d0ed57',
  '#ff9833',
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { isAdmin, setIsAdmin } = useAdmin();
  const { toast } = useToast();

  // Local state variables
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [statsTab, setStatsTab] = useState("traffic");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    action: () => {},
  });
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [trafficStats, setTrafficStats] = useState(getTrafficStatistics());
  const [userStats, setUserStats] = useState(getUserStatistics());
  const [contentStats, setContentStats] = useState(getContentStatistics());
  const [systemStats, setSystemStats] = useState(getSystemStatistics());

  // Initialize react-hook-form for banning a user
  const banForm = useForm<z.infer<typeof banUserSchema>>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      duration: "7 Days",
    },
  });

  // Initialize react-hook-form for upgrading a user to VIP
  const upgradeForm = useForm<z.infer<typeof upgradeToVIPSchema>>({
    resolver: zodResolver(upgradeToVIPSchema),
    defaultValues: {
      duration: "1 Month",
    },
  });

  // Function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to calculate percentage change
  const getPercentChange = () => {
    return `${Math.floor(Math.random() * 100)}%`;
  };

  // Mock function to fetch user data
  const fetchUsers = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? "admin" : i % 2 === 0 ? "vip" : "standard",
      status: i % 4 === 0 ? "active" : "inactive",
      lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      registrationDate: new Date(Date.now() - (i + 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }));
    setUsers(mockUsers);
    setLoading(false);
  };

  // Function to handle admin logout
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsAdmin(false);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/admin/login");
  };

  // Function to handle user impersonation
  const handleImpersonateUser = (user) => {
    setAlertConfig({
      title: "Impersonate User",
      description: `Are you sure you want to impersonate ${user.name}?`,
      action: () => {
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
        toast({
          title: "User Impersonated",
          description: `You are now impersonating ${user.name}.`,
        });
        navigate("/");
      },
    });
    setAlertOpen(true);
  };

  // Function to handle user deactivation
  const handleDeactivateUser = (user) => {
    setAlertConfig({
      title: "Deactivate User",
      description: `Are you sure you want to deactivate ${user.name}?`,
      action: () => {
        // Simulate API call
        toast({
          title: "User Deactivated",
          description: `${user.name} has been deactivated.`,
        });
      },
    });
    setAlertOpen(true);
  };

  // Function to handle user deletion
  const handleDeleteUser = (user) => {
    setAlertConfig({
      title: "Delete User",
      description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      action: () => {
        // Simulate API call
        toast({
          title: "User Deleted",
          description: `${user.name} has been permanently deleted.`,
        });
      },
    });
    setAlertOpen(true);
  };

  // Function to handle opening the ban user dialog
  const handleOpenBanDialog = (user) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  // Function to handle submitting the ban user form
  const submitBanUser = async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "User Banned",
      description: `${selectedUser?.name} has been banned for ${values.duration} with reason: ${values.reason}.`,
    });
    setBanDialogOpen(false);
  };

  // Function to handle opening the upgrade to VIP dialog
  const handleOpenUpgradeDialog = (user) => {
    setSelectedUser(user);
    setUpgradeDialogOpen(true);
  };

  // Function to handle submitting the upgrade to VIP form
  const submitUpgradeToVIP = async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "User Upgraded to VIP",
      description: `${selectedUser?.name} has been upgraded to VIP for ${values.duration}.`,
    });
    setUpgradeDialogOpen(false);
  };

  // useEffect hook to check admin login status and fetch user data on component mount
  useEffect(() => {
    const checkAdminLogin = async () => {
      const isLoggedIn = await isAdminLoggedIn();
      setIsAdmin(isLoggedIn);
      if (!isLoggedIn) {
        navigate("/admin/login");
      } else {
        fetchUsers();
      }
    };

    checkAdminLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setIsAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r border-r-slate-200 dark:border-r-slate-700 bg-white dark:bg-slate-800 flex flex-col">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage users, settings, and more.
            </p>
          </div>

          <div className="flex-1 p-4">
            <Tabs defaultValue="users" className="flex flex-col h-full">
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
              <TabsContent value="users" className="flex-1 p-4">
                {/* User management content will go here */}
              </TabsContent>
              <TabsContent value="statistics" className="flex-1 p-4">
                {/* Statistics content will go here */}
              </TabsContent>
              <TabsContent value="settings" className="flex-1 p-4">
                {/* Settings content will go here */}
              </TabsContent>
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
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg">Loading admin data...</p>
            </div>
          ) : (
            <>
              {/* User Management Tab */}
              {activeTab === "users" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">User Management</h2>
                    <div className="flex items-center space-x-2">
                      <Input type="search" placeholder="Search users..." className="md:w-64" />
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              {user.status === "active" ? (
                                <div className="flex items-center">
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  Active
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Inactive
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{user.lastLogin}</TableCell>
                            <TableCell>{user.registrationDate}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleImpersonateUser(user)}>
                                    <CircleUser className="mr-2 h-4 w-4" />
                                    Impersonate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenUpgradeDialog(user)}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Upgrade to VIP
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenBanDialog(user)}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeactivateUser(user)}>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Fix the chart components by removing invalid Tooltip props */}
              {activeTab === "statistics" && (
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
                    
                    {/* Traffic Stats */}
                    <TabsContent value="traffic">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(trafficStats.totalVisitors)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(trafficStats.totalPageViews)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{Math.floor(trafficStats.averageSessionDuration / 60)}m {trafficStats.averageSessionDuration % 60}s</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Daily Traffic</CardTitle>
                            <CardDescription>Visitors over the last 7 days</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trafficStats.dailyTraffic}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" />
                                  <Line type="monotone" dataKey="uniqueVisitors" stroke="#ffc658" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Traffic Sources</CardTitle>
                            <CardDescription>How users find the site</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={trafficStats.trafficSources}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {trafficStats.trafficSources.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Geography</CardTitle>
                          <CardDescription>Visitor distribution by country</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={trafficStats.visitorsByCountry}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8">
                                  {trafficStats.visitorsByCountry.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* User Stats */}
                    <TabsContent value="users">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Standard Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.totalStandardUsers)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.totalVipUsers)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.activeUsersToday)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from yesterday
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{userStats.conversionRate}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>User Registrations</CardTitle>
                            <CardDescription>New users over the last 7 days</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userStats.userRegistrations}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="standard" fill="#8884d8" name="Standard" />
                                  <Bar dataKey="vip" fill="#82ca9d" name="VIP" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>User Demographics</CardTitle>
                            <CardDescription>Age distribution of users</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={userStats.userDemographics.age}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {userStats.userDemographics.age.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Online Users</CardTitle>
                          <CardDescription>Users online by hour (last 24 hours)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={userStats.onlineUsers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Content Stats */}
                    <TabsContent value="content">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(contentStats.totalMessages)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(contentStats.totalUploads)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Messages/User</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{contentStats.averageMessagesPerUser}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Messages by Type</CardTitle>
                            <CardDescription>Messages per day over the last week</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={contentStats.messagesPerDay}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="standard" fill="#8884d8" name="Standard Users" />
                                  <Bar dataKey="vip" fill="#82ca9d" name="VIP Users" />
                                  <Bar dataKey="bot" fill="#ffc658" name="Bot Messages" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Media Uploads</CardTitle>
                            <CardDescription>Media uploads per day over the last week</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={contentStats.uploadsPerDay}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="images" stroke="#8884d8" name="Images" activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="videos" stroke="#82ca9d" name="Videos" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Bot Interactions</CardTitle>
                          <CardDescription>Most popular bots by interaction count</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={contentStats.botInteractions.slice(0, 10)}
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="botName" type="category" />
                                <Tooltip />
                                <Bar dataKey="interactions" fill="#8884d8">
                                  {contentStats.botInteractions.slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* System Stats - Added closing tag and content */}
                    <TabsContent value="system">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.cpuUsage}%</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from yesterday
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.memoryUsage}%</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from yesterday
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.diskSpace}%</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Server Performance</CardTitle>
                            <CardDescription>Resource usage over time</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={systemStats.serverPerformance}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="time" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU" activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory" />
                                  <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk I/O" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>API Response Times</CardTitle>
                            <CardDescription>Average response time per endpoint</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={systemStats.apiResponseTimes}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="endpoint" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="responseTime" fill="#8884d8" name="Response Time (ms)" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Error Rates</CardTitle>
                          <CardDescription>Server errors over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={systemStats.errorRates}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="errors" stroke="#ff0000" name="Errors" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="warnings" stroke="#ffaa00" name="Warnings" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      Manage your admin settings and preferences.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Update your admin security settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form>
                          <div className="space-y-4">
                            <FormField
                              name="current-password"
                              render={() => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Enter your current password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              name="new-password"
                              render={() => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Enter your new password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              name="confirm-password"
                              render={() => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirm your new password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit">Update Password</Button>
                          </div>
                        </Form>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure how and when you receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="email-notifications">Email Notifications</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Receive email notifications for important events
                              </p>
                            </div>
                            <Switch id="email-notifications" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="user-reports">User Reports</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Get notified when a user submits a report
                              </p>
                            </div>
                            <Switch id="user-reports" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="new-registrations">New Registrations</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Get notified about new user registrations
                              </p>
                            </div>
                            <Switch id="new-registrations" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                        <CardDescription>Configure global system settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Put the site in maintenance mode (only admins can access)
                              </p>
                            </div>
                            <Switch id="maintenance-mode" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="user-registration">User Registration</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Allow new users to register on the site
                              </p>
                            </div>
                            <Switch id="user-registration" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="auto-delete-reports">Auto-Delete Reports</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Automatically delete resolved reports after 30 days
                              </p>
                            </div>
                            <Switch id="auto-delete-reports" defaultChecked />
                          </div>
                          
                          <Button type="submit">Save Settings</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Alert Dialog for confirmations */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { alertConfig.action(); setAlertOpen(false); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && `You are about to ban ${selectedUser.name}.`}
              Please provide a reason and duration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...banForm}>
            <form onSubmit={banForm.handleSubmit(submitBanUser)} className="space-y-4">
              <FormField
                control={banForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for ban</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter reason..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={banForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ban Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 Day">1 Day</SelectItem>
                        <SelectItem value="3 Days">3 Days</SelectItem>
                        <SelectItem value="7 Days">7 Days</SelectItem>
                        <SelectItem value="30 Days">30 Days</SelectItem>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="submit">Ban User</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Upgrade to VIP Dialog */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to VIP</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && `You are about to upgrade ${selectedUser.name} to VIP status.`}
              Please select a duration for the VIP membership.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...upgradeForm}>
            <form onSubmit={upgradeForm.handleSubmit(submitUpgradeToVIP)} className="space-y-4">
              <FormField
                control={upgradeForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIP Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 Day">1 Day</SelectItem>
                        <SelectItem value="1 Week">1 Week</SelectItem>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                        <SelectItem value="1 Year">1 Year</SelectItem>
                        <SelectItem value="Lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="submit">Upgrade User</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
