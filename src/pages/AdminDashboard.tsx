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
import { Users, Settings, MessageSquare, LogOut, Ban, Edit, Trash2, Plus, Search, Bell, Mail, FileText, FileSearch, Shield, ShieldOff, CircleUser, CircleCheck, CircleX, ArrowRight, ArrowLeft, ChevronDown, CheckCircle2, XCircle, Clock, BarChart } from "lucide-react";
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
              <BarChart className="mr-2 h-5 w-5" />
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
                                          <Input
