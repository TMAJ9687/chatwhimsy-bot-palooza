
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
import { Users, Settings, MessageSquare, LogOut, Ban, Edit, Trash2, Plus, Search, Bell, Mail, FileText, FileSearch, Shield, ShieldOff, CircleUser, CircleCheck, CircleX, ArrowRight, ArrowLeft, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { VipDuration } from '@/types/admin';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
                                            {...field} 
                                            min={18} 
                                            max={70} 
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
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
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
                                            <SelectItem value="Japan">Japan</SelectItem>
                                            <SelectItem value="Brazil">Brazil</SelectItem>
                                            <SelectItem value="Mexico">Mexico</SelectItem>
                                            <SelectItem value="India">India</SelectItem>
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
                                        <FormLabel>Interests (comma separated)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Music, Travel, Sports..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <Button type="submit" disabled={isProcessing}>Create Bot</Button>
                                </form>
                              </Form>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-4">Bot List</h3>
                              <div className="space-y-4">
                                {bots.length === 0 ? (
                                  <p>No bots available. Create your first bot!</p>
                                ) : (
                                  bots.map((bot) => (
                                    <Card key={bot.id} className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">{bot.name}</h4>
                                          <p className="text-sm text-gray-500">
                                            {bot.age} years • {bot.gender} • {bot.country}
                                          </p>
                                          <div className="mt-2">
                                            <p className="text-sm">Interests: {bot.interests.join(", ")}</p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-red-500" 
                                            onClick={() => handleDeleteBot(bot.id, bot.name)}
                                            disabled={isProcessing}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Banned Users */}
                    <TabsContent value="banned-users">
                      <Card>
                        <CardHeader>
                          <CardTitle>Banned IPs/Users</CardTitle>
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
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bannedUsers.map((banned) => (
                                  <TableRow key={banned.id}>
                                    <TableCell>{banned.identifier}</TableCell>
                                    <TableCell>{banned.reason}</TableCell>
                                    <TableCell>{banned.duration}</TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleUnbanUser(banned.id, banned.identifier)}
                                        disabled={isProcessing}
                                      >
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
                      <TabsTrigger value="chat-settings">Chat Settings</TabsTrigger>
                      <TabsTrigger value="profanity">Profanity Words</TabsTrigger>
                      <TabsTrigger value="vip-prices">VIP Prices</TabsTrigger>
                      <TabsTrigger value="avatars">Avatars</TabsTrigger>
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
                            <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)} className="space-y-6">
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Google AdSense Links</h3>
                                
                                <FormField
                                  control={generalForm.control}
                                  name="adUnit1"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Ad Unit 1 Link</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://adservice.google.com/..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={generalForm.control}
                                  name="adUnit2"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Ad Unit 2 Link</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://adservice.google.com/..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={generalForm.control}
                                  name="adUnit3"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Ad Unit 3 Link</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://adservice.google.com/..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Maintenance Mode</h3>
                                
                                <FormField
                                  control={generalForm.control}
                                  name="maintenanceMode"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                      <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                          Maintenance Mode
                                        </FormLabel>
                                        <FormDescription>
                                          When enabled, the site will be in maintenance mode and only administrators can access it.
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
                              </div>
                              
                              <Button type="submit">Save Settings</Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Chat Settings */}
                    <TabsContent value="chat-settings">
                      <Card>
                        <CardHeader>
                          <CardTitle>Chat Settings</CardTitle>
                          <CardDescription>Configure chat-related settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...chatSettingsForm}>
                            <form onSubmit={chatSettingsForm.handleSubmit(handleSaveChatSettings)} className="space-y-6">
                              <FormField
                                control={chatSettingsForm.control}
                                name="maxImageUpload"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Image Upload Count (Standard Users)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} min={1} max={50} />
                                    </FormControl>
                                    <FormDescription>
                                      Maximum number of images standard users can upload per day.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Save Settings</Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Profanity Words */}
                    <TabsContent value="profanity">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profanity Words List</CardTitle>
                          <CardDescription>Manage blocked words in nicknames and chat</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...profanityForm}>
                            <form onSubmit={profanityForm.handleSubmit(handleSaveProfanity)} className="space-y-6">
                              <FormField
                                control={profanityForm.control}
                                name="nicknameProfanity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nickname Profanity</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Enter words separated by commas..." 
                                        {...field} 
                                        className="min-h-[100px]"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Words to be blocked in user nicknames (comma separated).
                                    </FormDescription>
                                    <FormMessage />
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
                                        placeholder="Enter words separated by commas..." 
                                        {...field} 
                                        className="min-h-[100px]"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Words to be blocked in chat messages (comma separated).
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Save Settings</Button>
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
                          <CardDescription>Configure VIP subscription plan prices</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...vipPricesForm}>
                            <form onSubmit={vipPricesForm.handleSubmit(handleSaveVIPPrices)} className="space-y-6">
                              <FormField
                                control={vipPricesForm.control}
                                name="plan1Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Plan 1 Price ($)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Monthly subscription price.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={vipPricesForm.control}
                                name="plan2Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Plan 2 Price ($)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Semi-annual subscription price.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={vipPricesForm.control}
                                name="plan3Price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Plan 3 Price ($)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Annual subscription price.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Save Prices</Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Avatars */}
                    <TabsContent value="avatars">
                      <Card>
                        <CardHeader>
                          <CardTitle>Avatars</CardTitle>
                          <CardDescription>Manage user avatars</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">VIP Avatars</h3>
                              
                              <div className="space-y-4">
                                <h4 className="font-medium">Male</h4>
                                <div className="p-4 border rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-center p-4 border rounded-lg border-dashed">
                                      <div className="text-center">
                                        <Button variant="outline" className="mb-2">
                                          <Plus className="mr-2 h-4 w-4" />
                                          Upload Avatar
                                        </Button>
                                        <p className="text-sm text-gray-500">
                                          Upload new male VIP avatars
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">👨</div>
                                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">👨🏼</div>
                                      <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center">👨🏾</div>
                                      <Button variant="outline" size="sm" className="ml-2">
                                        Manage
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <h4 className="font-medium">Female</h4>
                                <div className="p-4 border rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-center p-4 border rounded-lg border-dashed">
                                      <div className="text-center">
                                        <Button variant="outline" className="mb-2">
                                          <Plus className="mr-2 h-4 w-4" />
                                          Upload Avatar
                                        </Button>
                                        <p className="text-sm text-gray-500">
                                          Upload new female VIP avatars
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">👩</div>
                                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">👩🏻</div>
                                      <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center">👩🏽</div>
                                      <Button variant="outline" size="sm" className="ml-2">
                                        Manage
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Standard Avatars</h3>
                              
                              <div className="space-y-4">
                                <h4 className="font-medium">Male</h4>
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-center">
                                    <div className="mr-4">
                                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                                        👨
                                      </div>
                                    </div>
                                    <div>
                                      <p className="mb-2">Default male avatar</p>
                                      <Button variant="outline" size="sm">
                                        Change Default
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <h4 className="font-medium">Female</h4>
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-center">
                                    <div className="mr-4">
                                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                                        👩
                                      </div>
                                    </div>
                                    <div>
                                      <p className="mb-2">Default female avatar</p>
                                      <Button variant="outline" size="sm">
                                        Change Default
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button>Save Avatar Settings</Button>
                            </div>
                          </div>
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
                    <h2 className="text-3xl font-bold">Report & Feedback</h2>
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
                          <CardDescription>Review reports submitted by users</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {reports.length === 0 ? (
                            <p className="text-center py-4">No reports available at this time</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User ID</TableHead>
                                  <TableHead>Report Content</TableHead>
                                  <TableHead>Submitted</TableHead>
                                  <TableHead>Expires In</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {reports.map((report) => (
                                  <TableRow key={report.id}>
                                    <TableCell>{report.userId}</TableCell>
                                    <TableCell className="max-w-xs truncate">{report.content}</TableCell>
                                    <TableCell>{new Date(report.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                                        {formatExpiryDate(report.expiresAt)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {report.resolved ? (
                                        <span className="flex items-center text-green-500">
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          Resolved
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-yellow-500">
                                          <Clock className="h-4 w-4 mr-1" />
                                          Pending
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        {!report.resolved && (
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleResolveReportFeedback(report.id, "report")}
                                            disabled={isProcessing}
                                          >
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Resolve
                                          </Button>
                                        )}
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleDeleteReportFeedback(report.id, "report")}
                                          disabled={isProcessing}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Feedback */}
                    <TabsContent value="feedback">
                      <Card>
                        <CardHeader>
                          <CardTitle>User Feedback</CardTitle>
                          <CardDescription>Review feedback submitted by users</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {feedback.length === 0 ? (
                            <p className="text-center py-4">No feedback available at this time</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User ID</TableHead>
                                  <TableHead>Feedback Content</TableHead>
                                  <TableHead>Submitted</TableHead>
                                  <TableHead>Expires In</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {feedback.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.userId}</TableCell>
                                    <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                                        {formatExpiryDate(item.expiresAt)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {item.resolved ? (
                                        <span className="flex items-center text-green-500">
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          Resolved
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-yellow-500">
                                          <Clock className="h-4 w-4 mr-1" />
                                          Pending
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        {!item.resolved && (
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleResolveReportFeedback(item.id, "feedback")}
                                            disabled={isProcessing}
                                          >
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Resolve
                                          </Button>
                                        )}
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleDeleteReportFeedback(item.id, "feedback")}
                                          disabled={isProcessing}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
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
              
              {/* Admin Settings Content */}
              {activeTab === "admin-settings" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">Admin Settings</h2>
                  </div>
                  
                  <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="avatar">Admin Avatar</TabsTrigger>
                      <TabsTrigger value="password">Change Password</TabsTrigger>
                      <TabsTrigger value="display-name">Display Name</TabsTrigger>
                    </TabsList>
                    
                    {/* Admin Avatar */}
                    <TabsContent value="avatar">
                      <Card>
                        <CardHeader>
                          <CardTitle>Admin Avatar</CardTitle>
                          <CardDescription>Update your profile avatar</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4">
                            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl">
                              👨‍💼
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Current Avatar</h4>
                              <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Upload New Avatar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Change Password */}
                    <TabsContent value="password">
                      <Card>
                        <CardHeader>
                          <CardTitle>Change Password</CardTitle>
                          <CardDescription>Update your admin account password</CardDescription>
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
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Update Password</Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Display Name */}
                    <TabsContent value="display-name">
                      <Card>
                        <CardHeader>
                          <CardTitle>Display Name</CardTitle>
                          <CardDescription>Update your display name for the chat interface</CardDescription>
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
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      This name will be displayed in the chat when you send messages.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Update Display Name</Button>
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
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                alertConfig.action();
                setAlertOpen(false);
              }}
              disabled={isProcessing}
            >
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
              {selectedUser && `Enter ban details for ${selectedUser.name}`}
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
                      <Input placeholder="Why are you banning this user?" {...field} />
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
                          <SelectValue placeholder="Select ban duration" />
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <AlertDialogCancel
                  onClick={() => {
                    banForm.reset();
                    setSelectedUser(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" variant="destructive" disabled={isProcessing}>
                  Ban User
                </Button>
              </div>
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
              {selectedUser && `Select VIP subscription duration for ${selectedUser.name}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...upgradeForm}>
            <form onSubmit={upgradeForm.handleSubmit(submitUpgradeToVIP)} className="space-y-4 py-4">
              <FormField
                control={upgradeForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subscription duration" />
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <AlertDialogCancel
                  onClick={() => {
                    upgradeForm.reset();
                    setSelectedUser(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" variant="default" disabled={isProcessing}>
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
