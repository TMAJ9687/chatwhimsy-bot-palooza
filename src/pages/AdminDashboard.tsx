
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
                                            placeholder="Age" 
                                            min={18} 
                                            max={70} 
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
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
                                          value={field.value} 
                                          onValueChange={field.onChange}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
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
                                          value={field.value} 
                                          onValueChange={field.onChange}
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
                                          <Textarea
                                            placeholder="Comma separated interests"
                                            className="resize-none"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Enter comma-separated list of interests
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <Button type="submit" disabled={isProcessing}>
                                    <Plus className="mr-2 h-4 w-4" /> Create Bot
                                  </Button>
                                </form>
                              </Form>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-4">Existing Bots</h3>
                              {bots.length === 0 ? (
                                <p className="text-center py-4">No bots found</p>
                              ) : (
                                <div className="space-y-4">
                                  {bots.map(bot => (
                                    <Card key={bot.id} className="overflow-hidden">
                                      <div className="flex justify-between items-start p-4">
                                        <div>
                                          <h4 className="font-medium">
                                            {bot.name} {bot.vip && <span className="text-xs bg-purple-100 text-purple-700 py-0.5 px-2 rounded ml-2">VIP</span>}
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            {bot.age}, {bot.gender}, {bot.country}
                                          </p>
                                          <p className="text-sm mt-1">
                                            Interests: {bot.interests.join(', ')}
                                          </p>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleDeleteBot(bot.id, bot.name)}
                                          disabled={isProcessing}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
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
                            <p className="text-center py-4">No banned users or IPs found</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Identifier</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bannedUsers.map((ban) => (
                                  <TableRow key={ban.id}>
                                    <TableCell>{ban.identifier}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        ban.identifierType === 'user' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {ban.identifierType === 'user' ? 'User' : 'IP Address'}
                                      </span>
                                    </TableCell>
                                    <TableCell>{ban.reason}</TableCell>
                                    <TableCell>{ban.duration}</TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleUnbanUser(ban.id, ban.identifier)}
                                        disabled={isProcessing}
                                      >
                                        <ShieldOff className="mr-2 h-4 w-4" />
                                        Unban
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
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="profanity">Profanity Filter</TabsTrigger>
                      <TabsTrigger value="vip-prices">VIP Prices</TabsTrigger>
                    </TabsList>
                    
                    {/* General Settings */}
                    <TabsContent value="general">
                      <Card>
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Configure general site settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...generalForm}>
                            <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)} className="space-y-4">
                              <FormField
                                control={generalForm.control}
                                name="adUnit1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ad Unit 1</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ad Unit 1 URL" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      URL for the first ad unit
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={generalForm.control}
                                name="adUnit2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ad Unit 2</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ad Unit 2 URL" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      URL for the second ad unit
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={generalForm.control}
                                name="adUnit3"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ad Unit 3</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ad Unit 3 URL" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      URL for the third ad unit
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={generalForm.control}
                                name="maintenanceMode"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Maintenance Mode</FormLabel>
                                      <FormDescription>
                                        Put the site in maintenance mode
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Save General Settings
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Chat Settings */}
                    <TabsContent value="chat">
                      <Card>
                        <CardHeader>
                          <CardTitle>Chat Settings</CardTitle>
                          <CardDescription>Configure chat settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...chatSettingsForm}>
                            <form onSubmit={chatSettingsForm.handleSubmit(handleSaveChatSettings)} className="space-y-4">
                              <FormField
                                control={chatSettingsForm.control}
                                name="maxImageUpload"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Image Upload</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Maximum images per user" 
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Maximum number of image uploads per standard user
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Save Chat Settings
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Profanity Filter */}
                    <TabsContent value="profanity">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profanity Filter</CardTitle>
                          <CardDescription>Configure profanity filter</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...profanityForm}>
                            <form onSubmit={profanityForm.handleSubmit(handleSaveProfanity)} className="space-y-4">
                              <FormField
                                control={profanityForm.control}
                                name="nicknameProfanity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nickname Profanity</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Comma separated profanity words for nicknames"
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Comma-separated list of words to block in usernames
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profanityForm.control}
                                name="chatProfanity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Chat Profanity</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Comma separated profanity words for chat"
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Comma-separated list of words to block in chat messages
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Save Profanity Filter
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* VIP Prices */}
                    <TabsContent value="vip-prices">
                      <Card>
                        <CardHeader>
                          <CardTitle>VIP Prices</CardTitle>
                          <CardDescription>Configure VIP subscription prices</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...vipPricesForm}>
                            <form onSubmit={vipPricesForm.handleSubmit(handleSaveVIPPrices)} className="space-y-4">
                              <FormField
                                control={vipPricesForm.control}
                                name="plan1Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Basic Plan Price ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="Price in USD" 
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Monthly price for basic VIP plan
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={vipPricesForm.control}
                                name="plan2Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Premium Plan Price ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="Price in USD" 
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Monthly price for premium VIP plan
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={vipPricesForm.control}
                                name="plan3Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ultimate Plan Price ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="Price in USD" 
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Monthly price for ultimate VIP plan
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Save VIP Prices
                              </Button>
                            </form>
                          </Form>
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
                          <CardDescription>Manage user reports and complaints</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {reports.length === 0 ? (
                            <p className="text-center py-4">No reports found</p>
                          ) : (
                            <div className="space-y-4">
                              {reports.map(report => (
                                <Card key={report.id} className="overflow-hidden">
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium">
                                        Report ID: {report.id.substring(0, 8)}
                                        {report.resolved && (
                                          <span className="text-xs bg-green-100 text-green-700 py-0.5 px-2 rounded ml-2">
                                            Resolved
                                          </span>
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        {!report.resolved && (
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleResolveReportFeedback(report.id, 'report')}
                                            disabled={isProcessing}
                                          >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Resolve
                                          </Button>
                                        )}
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleDeleteReportFeedback(report.id, 'report')}
                                          disabled={isProcessing}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      User ID: {report.userId}
                                    </p>
                                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                      <p className="text-sm">{report.content}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                      <span>Submitted: {new Date(report.timestamp).toLocaleString()}</span>
                                      <span>Expires: {new Date(report.expiresAt).toLocaleString()}</span>
                                    </div>
                                  </div>
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
                          <CardDescription>Manage user feedback and suggestions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {feedback.length === 0 ? (
                            <p className="text-center py-4">No feedback found</p>
                          ) : (
                            <div className="space-y-4">
                              {feedback.map(item => (
                                <Card key={item.id} className="overflow-hidden">
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium">
                                        Feedback ID: {item.id.substring(0, 8)}
                                        {item.resolved && (
                                          <span className="text-xs bg-green-100 text-green-700 py-0.5 px-2 rounded ml-2">
                                            Resolved
                                          </span>
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        {!item.resolved && (
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleResolveReportFeedback(item.id, 'feedback')}
                                            disabled={isProcessing}
                                          >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Resolve
                                          </Button>
                                        )}
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleDeleteReportFeedback(item.id, 'feedback')}
                                          disabled={isProcessing}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      User ID: {item.userId}
                                    </p>
                                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                      <p className="text-sm">{item.content}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                      <span>Submitted: {new Date(item.timestamp).toLocaleString()}</span>
                                      <span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>
                                    </div>
                                  </div>
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
                    <h2 className="text-3xl font-bold">Statistics</h2>
                  </div>
                  
                  <Tabs value={statsTab} onValueChange={setStatsTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="traffic">Traffic</TabsTrigger>
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    
                    {/* Traffic Statistics */}
                    <TabsContent value="traffic">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Visitors
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(trafficStats.totalVisitors)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Page Views
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(trafficStats.totalPageViews)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Avg. Session Duration
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Math.floor(trafficStats.averageSessionDuration / 60)}m {trafficStats.averageSessionDuration % 60}s
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <Card className="col-span-1">
                          <CardHeader>
                            <CardTitle>Daily Traffic</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trafficStats.dailyTraffic}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="visitors" fill={CHART_COLORS[0]} name="Visitors" />
                                  <Bar dataKey="pageViews" fill={CHART_COLORS[1]} name="Page Views" />
                                  <Bar dataKey="uniqueVisitors" fill={CHART_COLORS[2]} name="Unique Visitors" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <div className="grid gap-4 grid-rows-2">
                          <Card>
                            <CardHeader>
                              <CardTitle>Traffic Sources</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={trafficStats.trafficSources}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={60}
                                      fill="#8884d8"
                                      paddingAngle={2}
                                      dataKey="value"
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Visitors by Country</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={trafficStats.visitorsByCountry}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={60}
                                      fill="#8884d8"
                                      paddingAngle={2}
                                      dataKey="value"
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                      {trafficStats.visitorsByCountry.map((entry, index) => (
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
                      </div>
                    </TabsContent>
                    
                    {/* User Statistics */}
                    <TabsContent value="users">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Standard Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.totalStandardUsers)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              VIP Users
                            </CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(userStats.totalVipUsers)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last month
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Conversion Rate
                            </CardTitle>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{userStats.conversionRate}</div>
                            <p className="text-xs text-muted-foreground">
                              Standard to VIP conversion
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <Card className="col-span-1">
                          <CardHeader>
                            <CardTitle>User Registrations</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userStats.userRegistrations}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="standard" fill={CHART_COLORS[0]} name="Standard Users" />
                                  <Bar dataKey="vip" fill={CHART_COLORS[1]} name="VIP Users" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <div className="grid gap-4 grid-rows-2">
                          <Card>
                            <CardHeader>
                              <CardTitle>Age Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={userStats.userDemographics.age}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={60}
                                      fill="#8884d8"
                                      paddingAngle={2}
                                      dataKey="value"
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={userStats.userDemographics.gender}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={60}
                                      fill="#8884d8"
                                      paddingAngle={2}
                                      dataKey="value"
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                      {userStats.userDemographics.gender.map((entry, index) => (
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
                      </div>
                      
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>Online Users (24h)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={userStats.onlineUsers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke={CHART_COLORS[0]} name="Online Users" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Content Statistics */}
                    <TabsContent value="content">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Messages
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(contentStats.totalMessages)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Uploads
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(contentStats.totalUploads)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Avg. Messages Per User
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{contentStats.averageMessagesPerUser}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Messages Per Day</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={contentStats.messagesPerDay}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="standard" fill={CHART_COLORS[0]} name="Standard Users" />
                                  <Bar dataKey="vip" fill={CHART_COLORS[1]} name="VIP Users" />
                                  <Bar dataKey="bot" fill={CHART_COLORS[2]} name="Bots" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Media Uploads</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={contentStats.uploadsPerDay}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="images" fill={CHART_COLORS[3]} name="Images" />
                                  <Bar dataKey="videos" fill={CHART_COLORS[4]} name="Videos" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>Top Bot Interactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={contentStats.botInteractions.slice(0, 5)} 
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="botName" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="interactions" fill={CHART_COLORS[0]} name="Interactions" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* System Statistics */}
                    <TabsContent value="system">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Server Uptime
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.uptime} days</div>
                            <p className="text-xs text-muted-foreground">
                              Last restart: {new Date(Date.now() - systemStats.uptime * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Requests
                            </CardTitle>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(systemStats.totalRequests)}</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Avg. Response Time
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{systemStats.averageResponseTime.toFixed(0)} ms</div>
                            <p className="text-xs text-muted-foreground">
                              {getPercentChange()} from last week
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Server Response Time (24h)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={systemStats.serverResponse}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="hour" />
                                  <YAxis domain={[0, 'dataMax + 50']} />
                                  <Tooltip />
                                  <Line 
                                    type="monotone" 
                                    dataKey="responseTime" 
                                    stroke={CHART_COLORS[0]} 
                                    name="Response Time (ms)" 
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Error Rates</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={systemStats.errorRates}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis 
                                    yAxisId="left"
                                    orientation="left"
                                    stroke={CHART_COLORS[0]}
                                  />
                                  <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    stroke={CHART_COLORS[5]}
                                  />
                                  <Tooltip />
                                  <Legend />
                                  <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="errors" 
                                    stroke={CHART_COLORS[0]} 
                                    name="Errors" 
                                  />
                                  <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="requests" 
                                    stroke={CHART_COLORS[5]} 
                                    name="Requests" 
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>System Resource Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={systemStats.resourceUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="value" name="Usage %">
                                  {systemStats.resourceUsage.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.value > 80 ? CHART_COLORS[5] : entry.value > 60 ? CHART_COLORS[6] : CHART_COLORS[4]} 
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
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
                      <TabsTrigger value="avatar">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    
                    {/* Admin Account */}
                    <TabsContent value="avatar">
                      <Card>
                        <CardHeader>
                          <CardTitle>Admin Account</CardTitle>
                          <CardDescription>Update your admin profile</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...adminSettingsForm}>
                            <form onSubmit={adminSettingsForm.handleSubmit(handleSaveAdminSettings)} className="space-y-4">
                              <FormField
                                control={adminSettingsForm.control}
                                name="displayName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Admin display name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Your name displayed to users
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Save Account Settings
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Admin Password */}
                    <TabsContent value="password">
                      <Card>
                        <CardHeader>
                          <CardTitle>Change Password</CardTitle>
                          <CardDescription>Update your admin password</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...adminSettingsForm}>
                            <form onSubmit={adminSettingsForm.handleSubmit(handleSaveAdminSettings)} className="space-y-4">
                              <FormField
                                control={adminSettingsForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Your current password" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={adminSettingsForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Your new password" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={adminSettingsForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Confirm new password" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" disabled={isProcessing}>
                                Update Password
                              </Button>
                            </form>
                          </Form>
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
      
      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={alertConfig.action}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Ban {selectedUser?.name} from the platform
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...banForm}>
            <form onSubmit={banForm.handleSubmit(submitBanUser)} className="space-y-4 py-4">
              <FormField
                control={banForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Reason for banning"
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
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 Day">1 Day</SelectItem>
                        <SelectItem value="3 Days">3 Days</SelectItem>
                        <SelectItem value="7 Days">7 Days</SelectItem>
                        <SelectItem value="14 Days">14 Days</SelectItem>
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
                <Button type="submit" disabled={isProcessing}>Ban User</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Upgrade User Dialog */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to VIP</AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade {selectedUser?.name} to VIP status
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...upgradeForm}>
            <form onSubmit={upgradeForm.handleSubmit(submitUpgradeToVIP)} className="space-y-4 py-4">
              <FormField
                control={upgradeForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
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
              
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isProcessing}>Upgrade User</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
