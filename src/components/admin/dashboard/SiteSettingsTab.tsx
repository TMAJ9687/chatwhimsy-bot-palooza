
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, MessageCircle, Crown, ImageIcon, Save, Trash2, Plus, AlertTriangle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const SiteSettingsTab: React.FC = () => {
  const { toast } = useToast();
  const { saveSiteSettings, getSiteSettings } = useAdmin();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Chatwii',
    siteDescription: 'A real-time chat application',
    adSense: {
      ad1: '',
      ad2: '',
      ad3: ''
    },
    maintenanceMode: false
  });
  
  // Chat settings
  const [chatSettings, setChatsSettings] = useState({
    maxImageUpload: 10,
    profanityFilter: true,
    profanityWords: [] as string[],
    nicknameProfanityWords: [] as string[]
  });
  
  // VIP settings
  const [vipSettings, setVipSettings] = useState({
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    lifetimePrice: 299.99
  });
  
  // Avatar settings
  const [avatarSettings, setAvatarSettings] = useState({
    vipMale: [] as string[],
    vipFemale: [] as string[],
    standardMale: [] as string[],
    standardFemale: [] as string[]
  });
  
  // New profanity word/nickname word
  const [newProfanityWord, setNewProfanityWord] = useState('');
  const [newNicknameWord, setNewNicknameWord] = useState('');
  
  // Load settings on initial render
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      
      // Load general settings
      const general = getSiteSettings('general');
      if (general) {
        setGeneralSettings(general);
      }
      
      // Load chat settings
      const chat = getSiteSettings('chat');
      if (chat) {
        setChatsSettings(chat);
      }
      
      // Load VIP settings
      const vip = getSiteSettings('vip');
      if (vip) {
        setVipSettings(vip);
      }
      
      // Load avatar settings
      const avatars = getSiteSettings('avatars');
      if (avatars) {
        setAvatarSettings(avatars);
      }
      
      setLoading(false);
    };
    
    loadSettings();
  }, [getSiteSettings]);
  
  // Save general settings
  const saveGeneralSettings = () => {
    setLoading(true);
    const success = saveSiteSettings('general', generalSettings);
    setLoading(false);
    
    if (success) {
      toast({
        title: 'General Settings Saved',
        description: 'Your site settings have been updated successfully'
      });
      setHasChanges(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save general settings',
        variant: 'destructive'
      });
    }
  };
  
  // Save chat settings
  const saveChatSettings = () => {
    setLoading(true);
    const success = saveSiteSettings('chat', chatSettings);
    setLoading(false);
    
    if (success) {
      toast({
        title: 'Chat Settings Saved',
        description: 'Your chat settings have been updated successfully'
      });
      setHasChanges(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save chat settings',
        variant: 'destructive'
      });
    }
  };
  
  // Save VIP settings
  const saveVipSettings = () => {
    setLoading(true);
    const success = saveSiteSettings('vip', vipSettings);
    setLoading(false);
    
    if (success) {
      toast({
        title: 'VIP Settings Saved',
        description: 'Your VIP pricing settings have been updated successfully'
      });
      setHasChanges(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save VIP settings',
        variant: 'destructive'
      });
    }
  };
  
  // Save avatar settings
  const saveAvatarSettings = () => {
    setLoading(true);
    const success = saveSiteSettings('avatars', avatarSettings);
    setLoading(false);
    
    if (success) {
      toast({
        title: 'Avatar Settings Saved',
        description: 'Your avatar settings have been updated successfully'
      });
      setHasChanges(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save avatar settings',
        variant: 'destructive'
      });
    }
  };
  
  // Add profanity word
  const addProfanityWord = () => {
    if (!newProfanityWord.trim()) return;
    
    setChatsSettings(prev => ({
      ...prev,
      profanityWords: [...prev.profanityWords, newProfanityWord.trim()]
    }));
    
    setNewProfanityWord('');
    setHasChanges(true);
  };
  
  // Remove profanity word
  const removeProfanityWord = (word: string) => {
    setChatsSettings(prev => ({
      ...prev,
      profanityWords: prev.profanityWords.filter(w => w !== word)
    }));
    setHasChanges(true);
  };
  
  // Add nickname profanity word
  const addNicknameWord = () => {
    if (!newNicknameWord.trim()) return;
    
    setChatsSettings(prev => ({
      ...prev,
      nicknameProfanityWords: [...prev.nicknameProfanityWords, newNicknameWord.trim()]
    }));
    
    setNewNicknameWord('');
    setHasChanges(true);
  };
  
  // Remove nickname profanity word
  const removeNicknameWord = (word: string) => {
    setChatsSettings(prev => ({
      ...prev,
      nicknameProfanityWords: prev.nicknameProfanityWords.filter(w => w !== word)
    }));
    setHasChanges(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Management</CardTitle>
        <CardDescription>
          Configure site settings, chat options, VIP pricing, and avatars
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat Settings
            </TabsTrigger>
            <TabsTrigger value="vip" className="flex items-center">
              <Crown className="mr-2 h-4 w-4" />
              VIP Prices
            </TabsTrigger>
            <TabsTrigger value="avatars" className="flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" />
              Avatars
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Information</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => {
                          setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }));
                          setHasChanges(true);
                        }}
                        placeholder="Enter site name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={generalSettings.siteDescription}
                        onChange={(e) => {
                          setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }));
                          setHasChanges(true);
                        }}
                        placeholder="Enter site description"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adsense Configuration</h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adsense1">Adsense Link 1</Label>
                    <Textarea
                      id="adsense1"
                      value={generalSettings.adSense.ad1}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          adSense: { ...prev.adSense, ad1: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      placeholder="Paste Google Adsense code here"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adsense2">Adsense Link 2</Label>
                    <Textarea
                      id="adsense2"
                      value={generalSettings.adSense.ad2}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          adSense: { ...prev.adSense, ad2: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      placeholder="Paste Google Adsense code here"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adsense3">Adsense Link 3</Label>
                    <Textarea
                      id="adsense3"
                      value={generalSettings.adSense.ad3}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          adSense: { ...prev.adSense, ad3: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      placeholder="Paste Google Adsense code here"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Status</h3>
                
                <div className="flex items-center space-x-4">
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(value) => {
                      setGeneralSettings(prev => ({ ...prev, maintenanceMode: value }));
                      setHasChanges(true);
                    }}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, site will display maintenance notice and restrict access
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={saveGeneralSettings} 
                  disabled={!hasChanges || loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save General Settings
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Chat Settings Tab */}
          <TabsContent value="chat">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Image Upload Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxImageUpload">Max Image Upload Count (Standard Users)</Label>
                    <Input
                      id="maxImageUpload"
                      type="number"
                      min="1"
                      value={chatSettings.maxImageUpload}
                      onChange={(e) => {
                        setChatsSettings(prev => ({ ...prev, maxImageUpload: parseInt(e.target.value) || 10 }));
                        setHasChanges(true);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of images standard users can upload (default: 10)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profanity Filter</h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  <Switch
                    id="profanityFilter"
                    checked={chatSettings.profanityFilter}
                    onCheckedChange={(value) => {
                      setChatsSettings(prev => ({ ...prev, profanityFilter: value }));
                      setHasChanges(true);
                    }}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="profanityFilter">Enable Profanity Filter</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter profane language in chat messages
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Chat Profanity List */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Chat Profanity Words</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add a word to filter"
                        value={newProfanityWord}
                        onChange={(e) => setNewProfanityWord(e.target.value)}
                      />
                      <Button size="sm" onClick={addProfanityWord}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="border rounded-md h-48">
                      <ScrollArea className="h-48 w-full">
                        <div className="p-4">
                          {chatSettings.profanityWords.length > 0 ? (
                            <div className="space-y-2">
                              {chatSettings.profanityWords.map((word, index) => (
                                <div
                                  key={`profanity-${index}`}
                                  className="flex items-center justify-between bg-secondary p-2 rounded-md"
                                >
                                  <span>{word}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeProfanityWord(word)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center pt-16">
                              No words added yet
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  
                  {/* Nickname Profanity List */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Nickname Profanity Words</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add a word to filter"
                        value={newNicknameWord}
                        onChange={(e) => setNewNicknameWord(e.target.value)}
                      />
                      <Button size="sm" onClick={addNicknameWord}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="border rounded-md h-48">
                      <ScrollArea className="h-48 w-full">
                        <div className="p-4">
                          {chatSettings.nicknameProfanityWords.length > 0 ? (
                            <div className="space-y-2">
                              {chatSettings.nicknameProfanityWords.map((word, index) => (
                                <div
                                  key={`nickname-${index}`}
                                  className="flex items-center justify-between bg-secondary p-2 rounded-md"
                                >
                                  <span>{word}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeNicknameWord(word)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center pt-16">
                              No words added yet
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={saveChatSettings} 
                  disabled={!hasChanges || loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Chat Settings
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* VIP Pricing Tab */}
          <TabsContent value="vip">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">VIP Subscription Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="monthlyPrice"
                        type="number"
                        min="0.00"
                        step="0.01"
                        value={vipSettings.monthlyPrice}
                        onChange={(e) => {
                          setVipSettings(prev => ({ 
                            ...prev, 
                            monthlyPrice: parseFloat(parseFloat(e.target.value).toFixed(2)) || 9.99 
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Price for 1 month VIP subscription
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="yearlyPrice"
                        type="number"
                        min="0.00"
                        step="0.01"
                        value={vipSettings.yearlyPrice}
                        onChange={(e) => {
                          setVipSettings(prev => ({ 
                            ...prev, 
                            yearlyPrice: parseFloat(parseFloat(e.target.value).toFixed(2)) || 99.99 
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Price for 1 year VIP subscription
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lifetimePrice">Lifetime Price ($)</Label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="lifetimePrice"
                        type="number"
                        min="0.00"
                        step="0.01"
                        value={vipSettings.lifetimePrice}
                        onChange={(e) => {
                          setVipSettings(prev => ({ 
                            ...prev, 
                            lifetimePrice: parseFloat(parseFloat(e.target.value).toFixed(2)) || 299.99 
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Price for lifetime VIP access
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={saveVipSettings} 
                  disabled={!hasChanges || loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save VIP Pricing
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Avatars Tab */}
          <TabsContent value="avatars">
            <div className="space-y-6">
              <div className="border p-4 mb-4 bg-amber-50 dark:bg-amber-950 rounded-md">
                <div className="flex items-center text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <p className="text-sm">Avatar management functionality will be implemented in a future update</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>VIP Avatars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Male VIP Avatars</h4>
                        <p className="text-muted-foreground">Coming soon</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Female VIP Avatars</h4>
                        <p className="text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Standard Avatars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Male Standard Avatars</h4>
                        <p className="text-muted-foreground">Coming soon</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Female Standard Avatars</h4>
                        <p className="text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end">
                <Button disabled>
                  <Save className="mr-2 h-4 w-4" />
                  Save Avatar Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsTab;
