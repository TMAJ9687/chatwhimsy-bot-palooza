
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

// Create form validation schemas
const botFormSchema = z.object({
  name: z.string().min(2, { message: "Bot name must be at least 2 characters." }),
  age: z.number().min(18, { message: "Age must be at least 18." }).max(70, { message: "Age must be at most 70." }),
  gender: z.string(),
  country: z.string(),
  interests: z.string()
});

const banFormSchema = z.object({
  reason: z.string().min(3, { message: "Reason must be at least 3 characters." }),
  duration: z.string()
});

const upgradeFormSchema = z.object({
  duration: z.string()
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState("user-management");
  const [userTab, setUserTab] = useState("vip-users");
  const [siteTab, setSiteTab] = useState("general");
  const [reportTab, setReportTab] = useState("reports");
  const [adminTab, setAdminTab] = useState("avatar");
  const [statsTab, setStatsTab] = useState("traffic");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    action: () => {}
  });
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statistics data
  const [trafficStats, setTrafficStats] = useState(getTrafficStatistics());
  const [userStats, setUserStats] = useState(getUserStatistics());
  const [contentStats, setContentStats] = useState(getContentStatistics());
  const [systemStats, setSystemStats] = useState(getSystemStatistics());
  
  // Statistics chart colors
  const CHART_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#EF4444', '#F59E0B', '#6366F1'];
  
  // Get admin functionality
  const {
    isAdmin: adminLoaded,
    loading,
    isProcessing,
    vipUsers,
    standardUsers,
    bots,
    bannedUsers,
    reportsFeedback,
    createBot,
    updateBot,
    deleteBot,
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    resolveReportFeedback,
    deleteReportFeedback,
    changeAdminPassword,
    adminLogout,
    saveSiteSettings,
    getSiteSettings
  } = useAdmin();
  
  // Check if user is logged in as admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAdmin && !isAdminLoggedIn()) {
        // Redirect to admin login if not logged in
        toast({
          title: "Access denied",
          description: "Please log in as admin to access this page",
          variant: "destructive"
        });
        navigate('/admin');
      }
    };
    
    checkAdminStatus();
  }, [isAdmin, navigate, toast]);
  
  // Form setup for banning user
  const banForm = useForm<z.infer<typeof banFormSchema>>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      reason: "",
      duration: "7 Days"
    }
  });
  
  // Form setup for upgrading user to VIP
  const upgradeForm = useForm<z.infer<typeof upgradeFormSchema>>({
    resolver: zodResolver(upgradeFormSchema),
    defaultValues: {
      duration: "1 Month"
    }
  });
  
  // Form setup for bot creation
  const botForm = useForm<z.infer<typeof botFormSchema>>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: "",
      age: 25,
      gender: "female",
      country: "United States", // Changed from USA to match bot profiles format
      interests: ""
    }
  });

  // General site settings form
  const generalForm = useForm({
    defaultValues: {
      adUnit1: getSiteSettings('general')?.adUnit1 || "https://adservice.google.com/adsense/unit1",
      adUnit2: getSiteSettings('general')?.adUnit2 || "https://adservice.google.com/adsense/unit2",
      adUnit3: getSiteSettings('general')?.adUnit3 || "https://adservice.google.com/adsense/unit3",
      maintenanceMode: getSiteSettings('general')?.maintenanceMode || false
    }
  });

  // Chat settings form
  const chatSettingsForm = useForm({
    defaultValues: {
      maxImageUpload: getSiteSettings('chat')?.maxImageUpload || 10
    }
  });

  // Profanity words form
  const profanityForm = useForm({
    defaultValues: {
      nicknameProfanity: getSiteSettings('profanity')?.nicknameProfanity || "bad1, bad2, bad3",
      chatProfanity: getSiteSettings('profanity')?.chatProfanity || "swear1, swear2, swear3"
    }
  });

  // VIP prices form
  const vipPricesForm = useForm({
    defaultValues: {
      plan1Price: getSiteSettings('vipPrices')?.plan1Price || 9.99,
      plan2Price: getSiteSettings('vipPrices')?.plan2Price || 19.99,
      plan3Price: getSiteSettings('vipPrices')?.plan3Price || 29.99
    }
  });

  // Admin settings form
  const adminSettingsForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      displayName: user?.nickname || "Admin"
    }
  });

  // Refresh statistics data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'statistics') {
        setTrafficStats(getTrafficStatistics());
        setUserStats(getUserStatistics());
        setContentStats(getContentStatistics());
        setSystemStats(getSystemStatistics());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle logout action
  const handleLogout = () => {
    setAlertConfig({
      title: "Confirm Logout",
      description: "Are you sure you want to log out of the admin dashboard?",
      action: () => {
        // Clear admin session and navigate to landing page
        adminLogout();
        navigate('/');
      }
    });
    setAlertOpen(true);
  };

  // User management actions
  const handleKickUser = (userId: string, username: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Confirm Kick User",
      description: `Are you sure you want to kick ${username}?`,
      action: async () => {
        const success = await kickUser(userId);
        if (success) {
          toast({
            title: "User kicked",
            description: `${username} has been kicked from the site`
          });
        }
      }
    });
    setAlertOpen(true);
  };

  const handleBanUser = (userId: string, username: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setSelectedUser({ id: userId, name: username });
    setBanDialogOpen(true);
  };

  const submitBanUser = async (data: z.infer<typeof banFormSchema>) => {
    if (!selectedUser || isProcessing) return;
    
    const banRecord = await banUser(selectedUser.id, 'user', data.reason, data.duration);
    
    if (banRecord) {
      toast({
        title: "User banned",
        description: `${selectedUser.name} has been banned from the site`
      });
    }
    
    // Close dialog and reset form
    setBanDialogOpen(false);
    banForm.reset();
    setSelectedUser(null);
  };

  const handleUnbanUser = (banId: string, identifier: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Confirm Unban",
      description: `Are you sure you want to unban ${identifier}?`,
      action: async () => {
        const success = await unbanUser(banId);
        if (success) {
          toast({
            title: "User unbanned",
            description: `${identifier} has been unbanned`
          });
        }
      }
    });
    setAlertOpen(true);
  };

  const handleUpgradeToVIP = (userId: string, username: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setSelectedUser({ id: userId, name: username });
    setUpgradeDialogOpen(true);
  };

  const submitUpgradeToVIP = async (data: z.infer<typeof upgradeFormSchema>) => {
    if (!selectedUser || isProcessing) return;
    
    const success = await upgradeToVIP(selectedUser.id, data.duration as VipDuration);
    
    if (success) {
      toast({
        title: "User upgraded",
        description: `${selectedUser.name} has been upgraded to VIP status for ${data.duration}`
      });
    }
    
    // Close dialog and reset form
    setUpgradeDialogOpen(false);
    upgradeForm.reset();
    setSelectedUser(null);
  };

  const handleDowngradeToStandard = (userId: string, username: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Downgrade to Standard",
      description: `Are you sure you want to downgrade ${username} to Standard status?`,
      action: async () => {
        const success = await downgradeToStandard(userId);
        if (success) {
          toast({
            title: "User downgraded",
            description: `${username} has been downgraded to Standard status`
          });
        }
      }
    });
    setAlertOpen(true);
  };
  
  // Report and feedback management
  const handleResolveReportFeedback = (id: string, type: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Confirm Resolution",
      description: `Are you sure you want to mark this ${type} as resolved?`,
      action: async () => {
        const success = await resolveReportFeedback(id);
        if (success) {
          toast({
            title: "Marked as resolved",
            description: `The ${type} has been marked as resolved`
          });
        }
      }
    });
    setAlertOpen(true);
  };
  
  const handleDeleteReportFeedback = (id: string, type: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Confirm Deletion",
      description: `Are you sure you want to delete this ${type}?`,
      action: async () => {
        const success = await deleteReportFeedback(id);
        if (success) {
          toast({
            title: "Deleted",
            description: `The ${type} has been deleted`
          });
        }
      }
    });
    setAlertOpen(true);
  };

  // Bot management
  const handleDeleteBot = (botId: string, botName: string) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    setAlertConfig({
      title: "Confirm Delete Bot",
      description: `Are you sure you want to delete ${botName}?`,
      action: async () => {
        const success = await deleteBot(botId);
        if (success) {
          toast({
            title: "Bot deleted",
            description: `${botName} has been deleted`
          });
        }
      }
    });
    setAlertOpen(true);
  };

  const handleCreateBot = async (data: z.infer<typeof botFormSchema>) => {
    if (isProcessing) return; // Prevent multiple clicks during processing
    
    // Convert interests from string to array
    const interestsArray = data.interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
    
    const newBot = await createBot({
      name: data.name,
      age: data.age,
      gender: data.gender,
      country: data.country,
      countryCode: data.country === 'United States' ? 'US' : 
                   data.country === 'United Kingdom' ? 'GB' : 
                   data.country.substring(0, 2).toUpperCase(),
      vip: false, // Default to standard bot
      interests: interestsArray,
      avatar: data.gender === 'male' ? '👨' : '👩',
      responses: [
        "Hello, nice to meet you!",
        "How's your day going?",
        "That's interesting, tell me more.",
        "I'd like to learn more about that."
      ]
    });
    
    if (newBot) {
      toast({
        title: "Bot Created",
        description: `The bot ${data.name} has been created successfully`
      });
      botForm.reset();
    }
  };

  // Site settings handlers
  const handleSaveGeneral = (data: any) => {
    if (saveSiteSettings('general', data)) {
      toast({
        title: "Settings Saved",
        description: "General settings have been updated"
      });
    }
  };

  const handleSaveChatSettings = (data: any) => {
    if (saveSiteSettings('chat', data)) {
      toast({
        title: "Settings Saved",
        description: "Chat settings have been updated"
      });
    }
  };

  const handleSaveProfanity = (data: any) => {
    if (saveSiteSettings('profanity', data)) {
      toast({
        title: "Settings Saved",
        description: "Profanity words list has been updated"
      });
    }
  };

  const handleSaveVIPPrices = (data: any) => {
    if (saveSiteSettings('vipPrices', data)) {
      toast({
        title: "Settings Saved",
        description: "VIP prices have been updated"
      });
    }
  };

  const handleSaveAdminSettings = (data: any) => {
    // Validate password change if attempted
    if (data.currentPassword && data.newPassword) {
      if (data.newPassword !== data.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      if (!changeAdminPassword(data.currentPassword, data.newPassword)) {
        return; // Error toast shown in the hook
      }
    }
    
    // Update display name if provided
    if (data.displayName && user) {
      const updatedUser = { ...user, nickname: data.displayName };
      localStorage.setItem('chatUser', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Settings Saved",
      description: "Your admin settings have been updated"
    });
  };

  // Filter users based on search term
  const filteredVipUsers = vipUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStandardUsers = standardUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter reports and feedback based on type
  const reports = reportsFeedback.filter(item => item.type === 'report');
  const feedback = reportsFeedback.filter(item => item.type === 'feedback');

  // Format expiry date for display
  const formatExpiryDate = (date: Date) => {
    const expiryDate = new Date(date);
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const diff = expiryDate.getTime() - now.getTime();
    
    // Convert to hours
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Format number for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate percentage change
  const getPercentChange = (): string => {
    // Random percentage change for demo
    const change = (Math.random() * 20 - 10).toFixed(1);
    return change.startsWith('-') ? change + '%' : '+' + change + '%';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <div className="flex h-screen">
        <div className="w-64 bg-slate-800 p-4 text-white">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          
          <nav className="space-y-1">
            <Button 
              variant={activeTab === "user-management" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("user-management")}
            >
              <Users className="mr-2 h-5 w-5" />
              User Management
            </Button>
            
            <Button 
              variant={activeTab === "site-management" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("site-management")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Site Management
            </Button>
            
            <Button 
              variant={activeTab === "report-feedback" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("report-feedback")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Report & Feedback
            </Button>
            
            <Button 
              variant={activeTab === "statistics" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("statistics")}
            >
              <BarChartIcon className="mr-2 h-5 w-5" />
              Statistics
            </Button>
            
            <Button 
              variant={activeTab === "admin-settings" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("admin-settings")}
            >
              <CircleUser className="mr-2 h-5 w-5" />
              Admin Settings
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Go to Chat
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" 
              onClick={handleLogout}
              disabled={isProcessing}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg">Loading admin data...</p>
            </div>
          ) : (
            <>
              {/* User Management Content */}
              {activeTab === "user-management" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">User Management</h2>
                  </div>
                  
                  <Tabs value={userTab} onValueChange={setUserTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="vip-users">VIP Users</TabsTrigger>
                      <TabsTrigger value="standard-users">Standard Users</TabsTrigger>
                      <TabsTrigger value="bots">Bots</TabsTrigger>
                      <TabsTrigger value="banned-users">Banned IPs/Users</TabsTrigger>
                    </TabsList>
                    
                    {/* VIP Users */}
                    <TabsContent value="vip-users">
                      <Card>
                        <CardHeader>
                          <CardTitle>VIP Users</CardTitle>
                          <CardDescription>Manage VIP users and their privileges</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center">
                            <Input 
                              placeholder="Search VIP users..." 
                              className="max-w-sm mr-2" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline">
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </Button>
                          </div>
                          
                          {filteredVipUsers.length === 0 ? (
                            <p className="text-center py-4">No VIP users found</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Username</TableHead>
                                  <TableHead>Age</TableHead>
                                  <TableHead>Country</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredVipUsers.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.age}</TableCell>
                                    <TableCell>{user.country}</TableCell>
                                    <TableCell>
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                        Online
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="sm" disabled={isProcessing}>
                                            Actions <ChevronDown className="ml-2 h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => handleKickUser(user.id, user.name)}>
                                            Kick
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleBanUser(user.id, user.name)}>
                                            Ban
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleDowngradeToStandard(user.id, user.name)}>
                                            Downgrade to Standard
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Standard Users */}
                    <TabsContent value="standard-users">
                      <Card>
                        <CardHeader>
                          <CardTitle>Standard Users</CardTitle>
                          <CardDescription>Manage standard users who are currently online</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center">
                            <Input 
                              placeholder="Search standard users..." 
                              className="max-w-sm mr-2" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline">
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </Button>
                          </div>
                          
                          {filteredStandardUsers.length === 0 ? (
                            <p className="text-center py-4">No standard users found</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Username</TableHead>
                                  <TableHead>Age</TableHead>
                                  <TableHead>Country</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredStandardUsers.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.age}</TableCell>
                                    <TableCell>{user.country}</TableCell>
                                    <TableCell>
                                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                                        Online
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="sm" disabled={isProcessing}>
                                            Actions <ChevronDown className="ml-2 h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => handleKickUser(user.id, user.name)}>
                                            Kick
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleBanUser(user.id, user.name)}>
                                            Ban
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleUpgradeToVIP(user.id, user.name)}>
                                            Upgrade to VIP
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Bots */}
                    <TabsContent value="bots">
                      <Card>
                        <CardHeader>
                          <CardTitle>Bots Management</CardTitle>
                          <CardDescription>Create and manage bots for the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium mb-4">Add New Bot</h3>
                              <Form {...botForm}>
                                <form onSubmit={botForm.handleSubmit(handleCreateBot)} className="space-y-4">
                                  <FormField
                                    control={botForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Bot name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={botForm.control}
                                    name="age"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            min={18} 
                                            max={70} 
                                            placeholder="Age" 
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={botForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <Select 
                                          onValueChange={field.onChange} 
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={botForm.control}
                                    name="country"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <Select 
                                          onValueChange={field.onChange} 
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="United States">United States</SelectItem>
                                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                            <SelectItem value="Canada">Canada</SelectItem>
                                            <SelectItem value="Australia">Australia</SelectItem>
                                            <SelectItem value="Germany">Germany</SelectItem>
                                            <SelectItem value="France">France</SelectItem>
                                            <SelectItem value="Spain">Spain</SelectItem>
                                            <SelectItem value="Italy">Italy</SelectItem>
                                            <SelectItem value="Brazil">Brazil</SelectItem>
                                            <SelectItem value="Japan">Japan</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={botForm.control}
                                    name="interests"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Interests</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g. music, travel, cooking (comma separated)" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                          Comma-separated list of interests
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <Button type="submit" disabled={isProcessing}>Create Bot</Button>
                                </form>
                              </Form>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-4">Existing Bots</h3>
                              
                              {bots.length === 0 ? (
                                <p className="text-center py-4">No bots created yet</p>
                              ) : (
                                <div className="space-y-4">
                                  {bots.map((bot) => (
                                    <Card key={bot.id} className="overflow-hidden">
                                      <CardContent className="p-0">
                                        <div className="p-4 flex justify-between items-center">
                                          <div className="flex items-center space-x-4">
                                            <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-10 w-10 flex items-center justify-center text-lg">
                                              {bot.avatar || (bot.gender === 'male' ? '👨' : '👩')}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{bot.name}</h4>
                                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {bot.age}, {bot.country} {bot.vip ? '(VIP)' : ''}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button size="sm" variant="outline">
                                              <Edit className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="destructive" 
                                              onClick={() => handleDeleteBot(bot.id, bot.name)}
                                              disabled={isProcessing}
                                            >
                                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Banned Users */}
                    <TabsContent value="banned-users">
                      <Card>
                        <CardHeader>
                          <CardTitle>Banned Users & IPs</CardTitle>
                          <CardDescription>Manage banned users and IP addresses</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {bannedUsers.length === 0 ? (
                            <p className="text-center py-4">No banned users or IPs</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User/IP</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bannedUsers.map((ban) => (
                                  <TableRow key={ban.id}>
                                    <TableCell>{ban.identifier}</TableCell>
                                    <TableCell>{ban.identifierType === 'ip' ? 'IP Address' : 'User'}</TableCell>
                                    <TableCell>{ban.reason}</TableCell>
                                    <TableCell>{ban.duration}</TableCell>
                                    <TableCell>{new Date(ban.timestamp).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleUnbanUser(ban.id, ban.identifier)}
                                        disabled={isProcessing}
                                      >
                                        <ShieldOff className="h-4 w-4 mr-1" /> Unban
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Site Management Content */}
              {activeTab === "site-management" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Site Management</h2>
                  </div>
                  
                  <Tabs value={siteTab} onValueChange={setSiteTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="chat-settings">Chat Settings</TabsTrigger>
                      <TabsTrigger value="profanity">Profanity Filter</TabsTrigger>
                      <TabsTrigger value="vip-prices">VIP Prices</TabsTrigger>
                    </TabsList>
                    
                    {/* General Settings */}
                    <TabsContent value="general">
                      <Card>
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Manage general site settings and options</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="adUnit1">Ad Unit 1 URL</Label>
                                <Input 
                                  id="adUnit1" 
                                  {...generalForm.register('adUnit1')} 
                                  placeholder="https://adservice.google.com/adsense/unit1" 
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="adUnit2">Ad Unit 2 URL</Label>
                                <Input 
                                  id="adUnit2" 
                                  {...generalForm.register('adUnit2')} 
                                  placeholder="https://adservice.google.com/adsense/unit2" 
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="adUnit3">Ad Unit 3 URL</Label>
                                <Input 
                                  id="adUnit3" 
                                  {...generalForm.register('adUnit3')} 
                                  placeholder="https://adservice.google.com/adsense/unit3" 
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="maintenanceMode" 
                                  checked={generalForm.watch('maintenanceMode')} 
                                  onCheckedChange={(checked) => generalForm.setValue('maintenanceMode', checked)} 
                                />
                                <Label htmlFor="maintenanceMode" className="cursor-pointer">Maintenance Mode</Label>
                              </div>
                            </div>
                            
                            <Button type="submit">Save Changes</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Chat Settings */}
                    <TabsContent value="chat-settings">
                      <Card>
                        <CardHeader>
                          <CardTitle>Chat Settings</CardTitle>
                          <CardDescription>Manage chat-related settings and limits</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={chatSettingsForm.handleSubmit(handleSaveChatSettings)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="maxImageUpload">Maximum Images Per User</Label>
                                <Input 
                                  id="maxImageUpload" 
                                  type="number" 
                                  min={1} 
                                  max={50} 
                                  {...chatSettingsForm.register('maxImageUpload', { 
                                    valueAsNumber: true 
                                  })} 
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                  Maximum number of images a standard user can upload per day
                                </p>
                              </div>
                            </div>
                            
                            <Button type="submit">Save Changes</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Profanity Filter */}
                    <TabsContent value="profanity">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profanity Filter</CardTitle>
                          <CardDescription>Configure words to be filtered in chat and nicknames</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={profanityForm.handleSubmit(handleSaveProfanity)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="nicknameProfanity">Nickname Profanity</Label>
                                <Textarea 
                                  id="nicknameProfanity" 
                                  {...profanityForm.register('nicknameProfanity')} 
                                  placeholder="bad1, bad2, bad3" 
                                  rows={4}
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                  Comma-separated list of words to block in usernames
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor="chatProfanity">Chat Profanity</Label>
                                <Textarea 
                                  id="chatProfanity" 
                                  {...profanityForm.register('chatProfanity')} 
                                  placeholder="swear1, swear2, swear3" 
                                  rows={6}
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                  Comma-separated list of words to filter in chat
                                </p>
                              </div>
                            </div>
                            
                            <Button type="submit">Save Changes</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* VIP Prices */}
                    <TabsContent value="vip-prices">
                      <Card>
                        <CardHeader>
                          <CardTitle>VIP Prices</CardTitle>
                          <CardDescription>Configure pricing for VIP subscription plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={vipPricesForm.handleSubmit(handleSaveVIPPrices)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="plan1Price">Basic Plan ($)</Label>
                                <Input 
                                  id="plan1Price" 
                                  type="number" 
                                  step="0.01" 
                                  min={0.99} 
                                  {...vipPricesForm.register('plan1Price', { 
                                    valueAsNumber: true 
                                  })} 
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="plan2Price">Standard Plan ($)</Label>
                                <Input 
                                  id="plan2Price" 
                                  type="number" 
                                  step="0.01" 
                                  min={0.99} 
                                  {...vipPricesForm.register('plan2Price', { 
                                    valueAsNumber: true 
                                  })} 
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="plan3Price">Premium Plan ($)</Label>
                                <Input 
                                  id="plan3Price" 
                                  type="number" 
                                  step="0.01" 
                                  min={0.99} 
                                  {...vipPricesForm.register('plan3Price', { 
                                    valueAsNumber: true 
                                  })} 
                                />
                              </div>
                            </div>
                            
                            <Button type="submit">Save Changes</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Report & Feedback Content */}
              {activeTab === "report-feedback" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Reports & Feedback</h2>
                  </div>
                  
                  <Tabs value={reportTab} onValueChange={setReportTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                      <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    </TabsList>
                    
                    {/* Reports */}
                    <TabsContent value="reports">
                      <Card>
                        <CardHeader>
                          <CardTitle>User Reports</CardTitle>
                          <CardDescription>Review and manage reports from users</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {reports.length === 0 ? (
                            <p className="text-center py-4">No active reports</p>
                          ) : (
                            <div className="space-y-4">
                              {reports.map((report) => (
                                <Card key={report.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="p-4 space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">Report against User: {report.userId}</h4>
                                          <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(report.timestamp).toLocaleString()} 
                                            {report.resolved && 
                                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                Resolved
                                              </span>
                                            }
                                          </p>
                                        </div>
                                        <div className="flex space-x-2">
                                          {!report.resolved && (
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => handleResolveReportFeedback(report.id, 'report')}
                                              disabled={isProcessing}
                                            >
                                              <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Resolved
                                            </Button>
                                          )}
                                          <Button 
                                            size="sm" 
                                            variant="destructive"
                                            onClick={() => handleDeleteReportFeedback(report.id, 'report')}
                                            disabled={isProcessing}
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                                        <p>{report.content}</p>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>
                                          <Clock className="h-3 w-3 inline-block mr-1" /> 
                                          Expires in: {formatExpiryDate(new Date(report.expiresAt))}
                                        </span>
                                        <div>
                                          {!report.resolved && (
                                            <Button 
                                              size="sm" 
                                              variant="link" 
                                              className="text-xs h-auto p-0"
                                            >
                                              Ban user <Ban className="h-3 w-3 ml-1" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Feedback */}
                    <TabsContent value="feedback">
                      <Card>
                        <CardHeader>
                          <CardTitle>User Feedback</CardTitle>
                          <CardDescription>Review feedback provided by users</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {feedback.length === 0 ? (
                            <p className="text-center py-4">No active feedback</p>
                          ) : (
                            <div className="space-y-4">
                              {feedback.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="p-4 space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">Feedback from User: {item.userId}</h4>
                                          <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(item.timestamp).toLocaleString()}
                                            {item.resolved && 
                                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                Reviewed
                                              </span>
                                            }
                                          </p>
                                        </div>
                                        <div className="flex space-x-2">
                                          {!item.resolved && (
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => handleResolveReportFeedback(item.id, 'feedback')}
                                              disabled={isProcessing}
                                            >
                                              <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Reviewed
                                            </Button>
                                          )}
                                          <Button 
                                            size="sm" 
                                            variant="destructive"
                                            onClick={() => handleDeleteReportFeedback(item.id, 'feedback')}
                                            disabled={isProcessing}
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                                        <p>{item.content}</p>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>
                                          <Clock className="h-3 w-3 inline-block mr-1" /> 
                                          Expires in: {formatExpiryDate(new Date(item.expiresAt))}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Statistics Content */}
              {activeTab === "statistics" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Statistics & Analytics</h2>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(trafficStats.totalVisitors)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{Math.floor(trafficStats.averageSessionDuration / 60)}m {trafficStats.averageSessionDuration % 60}s</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Visitors (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                visitors: { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                pageViews: { theme: { light: "#F97316", dark: "#FB923C" }},
                                uniqueVisitors: { theme: { light: "#10B981", dark: "#34D399" }}
                              }}
                            >
                              <BarChart data={trafficStats.dailyTraffic}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelClassName="font-medium text-sm"
                                      indicator="line"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Bar dataKey="visitors" name="Visitors" fill="var(--color-visitors)" />
                                <Bar dataKey="pageViews" name="Page Views" fill="var(--color-pageViews)" />
                                <Bar dataKey="uniqueVisitors" name="Unique Visitors" fill="var(--color-uniqueVisitors)" />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Traffic Sources</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                              <ChartContainer
                                config={{
                                  Direct: { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                  Search: { theme: { light: "#F97316", dark: "#FB923C" }},
                                  Social: { theme: { light: "#10B981", dark: "#34D399" }},
                                  Referral: { theme: { light: "#0EA5E9", dark: "#38BDF8" }},
                                  Other: { theme: { light: "#6366F1", dark: "#818CF8" }}
                                }}
                              >
                                <PieChart>
                                  <Pie
                                    data={trafficStats.trafficSources}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label
                                  >
                                    {trafficStats.trafficSources.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    content={
                                      <ChartTooltipContent
                                        nameKey="name"
                                        labelKey="name"
                                        formatLabel={(value) => `${value}%`}
                                      />
                                    }
                                  />
                                  <Legend 
                                    content={
                                      <ChartLegendContent
                                        className="mt-2"
                                      />
                                    }
                                  />
                                </PieChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Countries</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                              <ChartContainer
                                config={{
                                  "United States": { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                  "United Kingdom": { theme: { light: "#F97316", dark: "#FB923C" }},
                                  "Germany": { theme: { light: "#10B981", dark: "#34D399" }},
                                  "France": { theme: { light: "#0EA5E9", dark: "#38BDF8" }},
                                  "Canada": { theme: { light: "#6366F1", dark: "#818CF8" }},
                                  "Other": { theme: { light: "#D946EF", dark: "#E879F9" }}
                                }}
                              >
                                <PieChart>
                                  <Pie
                                    data={trafficStats.visitorsByCountry}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label
                                  >
                                    {trafficStats.visitorsByCountry.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.name.replace(/\s+/g, "\\\ ")}`} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    content={
                                      <ChartTooltipContent
                                        nameKey="name"
                                        labelKey="name"
                                        formatLabel={(value) => `${value}%`}
                                      />
                                    }
                                  />
                                  <Legend 
                                    content={
                                      <ChartLegendContent
                                        className="mt-2"
                                      />
                                    }
                                  />
                                </PieChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* User Stats */}
                    <TabsContent value="users">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Standard Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.totalStandardUsers)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>User Registrations (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                standard: { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                vip: { theme: { light: "#F97316", dark: "#FB923C" }}
                              }}
                            >
                              <BarChart data={userStats.userRegistrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelClassName="font-medium text-sm"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Bar dataKey="standard" name="Standard Users" fill="var(--color-standard)" />
                                <Bar dataKey="vip" name="VIP Users" fill="var(--color-vip)" />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Online Users (Last 24 Hours)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                users: { theme: { light: "#10B981", dark: "#34D399" }}
                              }}
                            >
                              <LineChart data={userStats.onlineUsers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelKey="hour"
                                      indicator="dot"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="users" 
                                  name="Online Users" 
                                  stroke="var(--color-users)" 
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>User Age Demographics</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[300px]">
                            <ChartContainer
                              config={{
                                "18-24": { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                "25-34": { theme: { light: "#F97316", dark: "#FB923C" }},
                                "35-44": { theme: { light: "#10B981", dark: "#34D399" }},
                                "45-54": { theme: { light: "#0EA5E9", dark: "#38BDF8" }},
                                "55+": { theme: { light: "#6366F1", dark: "#818CF8" }}
                              }}
                            >
                              <PieChart>
                                <Pie
                                  data={userStats.userDemographics.age}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  fill="#8884d8"
                                  label
                                >
                                  {userStats.userDemographics.age.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      nameKey="name"
                                      labelKey="name"
                                      formatLabel={(value) => `${value}%`}
                                    />
                                  }
                                />
                                <Legend 
                                  content={
                                    <ChartLegendContent
                                      className="mt-2"
                                    />
                                  }
                                />
                              </PieChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>User Gender Distribution</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[300px]">
                            <ChartContainer
                              config={{
                                "Male": { theme: { light: "#0EA5E9", dark: "#38BDF8" }},
                                "Female": { theme: { light: "#D946EF", dark: "#E879F9" }},
                                "Other": { theme: { light: "#10B981", dark: "#34D399" }}
                              }}
                            >
                              <PieChart>
                                <Pie
                                  data={userStats.userDemographics.gender}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  fill="#8884d8"
                                  label
                                >
                                  {userStats.userDemographics.gender.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      nameKey="name"
                                      labelKey="name"
                                      formatLabel={(value) => `${value}%`}
                                    />
                                  }
                                />
                                <Legend 
                                  content={
                                    <ChartLegendContent
                                      className="mt-2"
                                    />
                                  }
                                />
                              </PieChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    {/* Content Stats */}
                    <TabsContent value="content">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(contentStats.totalMessages)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Messages per User</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{contentStats.averageMessagesPerUser}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Messages per Day (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                standard: { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                                vip: { theme: { light: "#F97316", dark: "#FB923C" }},
                                bot: { theme: { light: "#10B981", dark: "#34D399" }}
                              }}
                            >
                              <BarChart data={contentStats.messagesPerDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelClassName="font-medium text-sm"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Bar dataKey="standard" name="Standard Users" fill="var(--color-standard)" />
                                <Bar dataKey="vip" name="VIP Users" fill="var(--color-vip)" />
                                <Bar dataKey="bot" name="Bot Messages" fill="var(--color-bot)" />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Media Uploads (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                images: { theme: { light: "#0EA5E9", dark: "#38BDF8" }},
                                videos: { theme: { light: "#D946EF", dark: "#E879F9" }}
                              }}
                            >
                              <BarChart data={contentStats.uploadsPerDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelClassName="font-medium text-sm"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Bar dataKey="images" name="Image Uploads" fill="var(--color-images)" />
                                <Bar dataKey="videos" name="Video Uploads" fill="var(--color-videos)" />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Bot Interactions (Top 10)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ChartContainer
                            config={{
                              interactions: { theme: { light: "#8B5CF6", dark: "#A78BFA" }}
                            }}
                          >
                            <BarChart 
                              data={contentStats.botInteractions}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="botName" />
                              <Tooltip
                                content={
                                  <ChartTooltipContent
                                    labelKey="botName"
                                  />
                                }
                              />
                              <Bar dataKey="interactions" name="Interactions" fill="var(--color-interactions)" />
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* System Stats */}
                    <TabsContent value="system">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.uptime} days</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last restart: {new Date(Date.now() - systemStats.uptime * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(systemStats.totalRequests)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.averageResponseTime.toFixed(2)}ms</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Server Response Time (Last 24 Hours)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                responseTime: { theme: { light: "#10B981", dark: "#34D399" }}
                              }}
                            >
                              <LineChart data={systemStats.serverResponse}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelKey="hour"
                                      indicator="dot"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="responseTime" 
                                  name="Response Time (ms)" 
                                  stroke="var(--color-responseTime)" 
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Error Rates (Last 7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-80">
                            <ChartContainer
                              config={{
                                errorRate: { theme: { light: "#EF4444", dark: "#F87171" }}
                              }}
                            >
                              <LineChart data={systemStats.errorRates.map(item => ({
                                ...item, 
                                errorRate: (item.errors / item.requests * 100).toFixed(2)
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  content={
                                    <ChartTooltipContent
                                      labelKey="date"
                                      indicator="dot"
                                    />
                                  }
                                />
                                <Legend
                                  content={
                                    <ChartLegendContent
                                      className="mt-3"
                                    />
                                  }
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="errorRate" 
                                  name="Error Rate (%)" 
                                  stroke="var(--color-errorRate)" 
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Resource Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                          <ChartContainer
                            config={{
                              "CPU": { theme: { light: "#8B5CF6", dark: "#A78BFA" }},
                              "Memory": { theme: { light: "#F97316", dark: "#FB923C" }},
                              "Disk": { theme: { light: "#10B981", dark: "#34D399" }},
                              "Network": { theme: { light: "#0EA5E9", dark: "#38BDF8" }}
                            }}
                          >
                            <BarChart 
                              data={systemStats.resourceUsage}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis type="category" dataKey="name" />
                              <Tooltip
                                content={
                                  <ChartTooltipContent
                                    labelKey="name"
                                    formatLabel={(value) => `${value}%`}
                                  />
                                }
                              />
                              <Bar dataKey="value" name="Usage (%)" radius={[0, 4, 4, 0]}>
                                {systemStats.resourceUsage.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Admin Settings Content */}
              {activeTab === "admin-settings" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Admin Settings</h2>
                  </div>
                  
                  <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    
                    {/* Account Settings */}
                    <TabsContent value="account">
                      <Card>
                        <CardHeader>
                          <CardTitle>Account Settings</CardTitle>
                          <CardDescription>Update your admin account settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={adminSettingsForm.handleSubmit(handleSaveAdminSettings)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input 
                                  id="displayName" 
                                  {...adminSettingsForm.register('displayName')} 
                                  placeholder="Admin" 
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="bg-slate-800 rounded-full h-14 w-14 flex items-center justify-center text-xl">
                                  <CircleUser className="h-8 w-8 text-white" />
                                </div>
                                <Button type="button" variant="outline">
                                  Change Avatar
                                </Button>
                              </div>
                            </div>
                            
                            <Button type="submit">Save Changes</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Security Settings */}
                    <TabsContent value="security">
                      <Card>
                        <CardHeader>
                          <CardTitle>Security Settings</CardTitle>
                          <CardDescription>Update your password and security preferences</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={adminSettingsForm.handleSubmit(handleSaveAdminSettings)} className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input 
                                  id="currentPassword" 
                                  type="password" 
                                  {...adminSettingsForm.register('currentPassword')} 
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input 
                                  id="newPassword" 
                                  type="password" 
                                  {...adminSettingsForm.register('newPassword')}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input 
                                  id="confirmPassword" 
                                  type="password" 
                                  {...adminSettingsForm.register('confirmPassword')}
                                />
                              </div>
                            </div>
                            
                            <Button type="submit">Change Password</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modals and Dialogs */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              alertConfig.action();
              setAlertOpen(false);
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Set ban duration and reason. This will prevent the user from accessing the site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...banForm}>
            <form onSubmit={banForm.handleSubmit(submitBanUser)} className="space-y-4 py-2">
              <FormField
                control={banForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Reason for ban..." 
                        className="resize-none" 
                        {...field} 
                      />
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
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 Hour">1 Hour</SelectItem>
                        <SelectItem value="24 Hours">24 Hours</SelectItem>
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
              
              <div className="flex justify-between pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setBanDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={isProcessing}
                >
                  Ban User
                </Button>
              </div>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Upgrade User Dialog */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade User to VIP: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Select VIP duration for this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...upgradeForm}>
            <form onSubmit={upgradeForm.handleSubmit(submitUpgradeToVIP)} className="space-y-4 py-2">
              <FormField
                control={upgradeForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIP Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
              
              <div className="flex justify-between pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setUpgradeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isProcessing}
                >
                  Upgrade User
                </Button>
              </div>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
