
import React, { useState } from 'react';
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
import { Users, Settings, MessageSquare, LogOut, Ban, Edit, Trash2, Plus, Search, Bell, Mail, FileText, FileSearch, Shield, ShieldOff, CircleUser, CircleCheck, CircleX, ArrowRight, ArrowLeft, ChevronDown } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  
  // Sample data for demonstration
  const vipUsers = [
    { id: 1, username: "VIPUser1", registrationDate: "2023-05-10", lastLogin: "2023-11-15", status: "Online" },
    { id: 2, username: "VIPUser2", registrationDate: "2023-06-20", lastLogin: "2023-11-10", status: "Offline" },
    { id: 3, username: "VIPUser3", registrationDate: "2023-07-15", lastLogin: "2023-11-12", status: "Online" }
  ];
  
  const standardUsers = [
    { id: 4, username: "StdUser1", registrationDate: "2023-08-05", lastLogin: "2023-11-14", status: "Online" },
    { id: 5, username: "StdUser2", registrationDate: "2023-09-12", lastLogin: "2023-11-13", status: "Online" }
  ];
  
  const bots = [
    { id: 1, name: "BotName1", age: 25, gender: "Female", country: "USA", interests: ["Music", "Travel"] },
    { id: 2, name: "BotName2", age: 30, gender: "Male", country: "UK", interests: ["Sports", "Movies"] }
  ];
  
  const bannedUsers = [
    { id: 1, identifier: "BannedUser1", reason: "Inappropriate messages", duration: "7 Days" },
    { id: 2, identifier: "192.168.1.1", reason: "Spam", duration: "Permanent" }
  ];
  
  const reports = [
    { id: 1, reportedItem: "User123", reportingUser: "User456", reason: "Harassment", timestamp: "2023-11-10 14:30" },
    { id: 2, reportedItem: "Message #789", reportingUser: "User789", reason: "Spam", timestamp: "2023-11-11 09:45" }
  ];
  
  const feedbacks = [
    { id: 1, user: "User123", content: "Great experience!", timestamp: "2023-11-09 16:20" },
    { id: 2, user: "Anonymous", content: "Could use more features.", timestamp: "2023-11-10 11:35" }
  ];

  // General site settings form
  const generalForm = useForm({
    defaultValues: {
      adUnit1: "https://adservice.google.com/adsense/unit1",
      adUnit2: "https://adservice.google.com/adsense/unit2",
      adUnit3: "https://adservice.google.com/adsense/unit3",
      maintenanceMode: false
    }
  });

  // Chat settings form
  const chatSettingsForm = useForm({
    defaultValues: {
      maxImageUpload: 10
    }
  });

  // Profanity words form
  const profanityForm = useForm({
    defaultValues: {
      nicknameProfanity: "bad1, bad2, bad3",
      chatProfanity: "swear1, swear2, swear3"
    }
  });

  // VIP prices form
  const vipPricesForm = useForm({
    defaultValues: {
      plan1Price: 9.99,
      plan2Price: 19.99,
      plan3Price: 29.99
    }
  });

  // Admin settings form
  const adminSettingsForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      displayName: "Admin"
    }
  });

  // Bot creation form
  const botForm = useForm({
    defaultValues: {
      name: "",
      age: 25,
      gender: "female",
      country: "USA",
      interests: ""
    }
  });

  const handleLogout = () => {
    setAlertConfig({
      title: "Confirm Logout",
      description: "Are you sure you want to log out of the admin dashboard?",
      action: () => {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully"
        });
        navigate('/admin');
      }
    });
    setAlertOpen(true);
  };

  const handleKickUser = (username) => {
    setAlertConfig({
      title: "Confirm Kick User",
      description: `Are you sure you want to kick ${username}?`,
      action: () => {
        toast({
          title: "User kicked",
          description: `${username} has been kicked from the site`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleBanUser = (username) => {
    setAlertConfig({
      title: "Ban User",
      description: `Please select a duration and provide a reason for banning ${username}`,
      action: () => {
        toast({
          title: "User banned",
          description: `${username} has been banned from the site`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleUnbanUser = (identifier) => {
    setAlertConfig({
      title: "Confirm Unban",
      description: `Are you sure you want to unban ${identifier}?`,
      action: () => {
        toast({
          title: "User unbanned",
          description: `${identifier} has been unbanned`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleUpgradeToVIP = (username) => {
    setAlertConfig({
      title: "Upgrade to VIP",
      description: `Are you sure you want to upgrade ${username} to VIP status?`,
      action: () => {
        toast({
          title: "User upgraded",
          description: `${username} has been upgraded to VIP status`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleDowngradeToStandard = (username) => {
    setAlertConfig({
      title: "Downgrade to Standard",
      description: `Are you sure you want to downgrade ${username} to Standard status?`,
      action: () => {
        toast({
          title: "User downgraded",
          description: `${username} has been downgraded to Standard status`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleDeleteBot = (botName) => {
    setAlertConfig({
      title: "Confirm Delete Bot",
      description: `Are you sure you want to delete ${botName}?`,
      action: () => {
        toast({
          title: "Bot deleted",
          description: `${botName} has been deleted`
        });
      }
    });
    setAlertOpen(true);
  };

  const handleSaveGeneral = (data) => {
    console.log("General settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "General settings have been updated"
    });
  };

  const handleSaveChatSettings = (data) => {
    console.log("Chat settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Chat settings have been updated"
    });
  };

  const handleSaveProfanity = (data) => {
    console.log("Profanity settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Profanity words list has been updated"
    });
  };

  const handleSaveVIPPrices = (data) => {
    console.log("VIP prices saved:", data);
    toast({
      title: "Settings Saved",
      description: "VIP prices have been updated"
    });
  };

  const handleSaveAdminSettings = (data) => {
    console.log("Admin settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Your admin settings have been updated"
    });
  };

  const handleCreateBot = (data) => {
    console.log("Bot created:", data);
    toast({
      title: "Bot Created",
      description: `The bot ${data.name} has been created successfully`
    });
    botForm.reset();
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
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
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
                        />
                        <Button variant="outline">
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vipUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.registrationDate}</TableCell>
                              <TableCell>{user.lastLogin}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {user.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleKickUser(user.username)}>
                                      Kick
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBanUser(user.username)}>
                                      Ban
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDowngradeToStandard(user.username)}>
                                      Downgrade to Standard
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                        />
                        <Button variant="outline">
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standardUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.registrationDate}</TableCell>
                              <TableCell>{user.lastLogin}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                                  {user.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleKickUser(user.username)}>
                                      Kick
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBanUser(user.username)}>
                                      Ban
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpgradeToVIP(user.username)}>
                                      Upgrade to VIP
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                                      <Input type="number" {...field} min={18} max={70} />
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
                                        <SelectItem value="USA">United States</SelectItem>
                                        <SelectItem value="UK">United Kingdom</SelectItem>
                                        <SelectItem value="Canada">Canada</SelectItem>
                                        <SelectItem value="Australia">Australia</SelectItem>
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
                              
                              <Button type="submit">Create Bot</Button>
                            </form>
                          </Form>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Bot List</h3>
                          <div className="space-y-4">
                            {bots.map((bot) => (
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
                                      onClick={() => handleDeleteBot(bot.name)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
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
                                  onClick={() => handleUnbanUser(banned.identifier)}
                                >
                                  Unban
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                                  <div className="h-12 w-12 rounded-full bg-gray-400"></div>
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
                                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                                  <div className="h-12 w-12 rounded-full bg-gray-400"></div>
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
                                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    Default
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
                                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    Default
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reported Item</TableHead>
                            <TableHead>Reporting User</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>{report.reportedItem}</TableCell>
                              <TableCell>{report.reportingUser}</TableCell>
                              <TableCell>{report.reason}</TableCell>
                              <TableCell>{report.timestamp}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Take Action
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Dismiss
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feedbacks.map((feedback) => (
                            <TableRow key={feedback.id}>
                              <TableCell>{feedback.user}</TableCell>
                              <TableCell>{feedback.content}</TableCell>
                              <TableCell>{feedback.timestamp}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Mark Resolved
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                        <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl">
                          Admin
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
                                  This name will be displayed to users in the chat interface.
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
        </div>
      </div>
      
      {/* Alert Dialog for confirmations */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={alertConfig.action}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
