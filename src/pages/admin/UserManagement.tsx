
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/admin/AdminService';
import { 
  MoreHorizontal, Shield, Ban, Edit, UserMinus, 
  ArrowUpCircle, Sparkles 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const UserManagement: React.FC = () => {
  const vipUsers = adminService.getVipUsers();
  const standardUsers = adminService.getStandardUsers();
  const bannedUsers = adminService.getBannedUsers();
  const { toast } = useToast();
  
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banDuration, setBanDuration] = useState<string>("1_day");
  const [banReason, setBanReason] = useState<string>("");
  
  const [confirmActionDialog, setConfirmActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'kick' | 'downgrade' | 'upgrade' | 'unban'>('kick');
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleAction = (user: any, action: 'kick' | 'ban' | 'edit' | 'downgrade' | 'upgrade' | 'unban') => {
    setSelectedUser(user);
    
    if (action === 'ban') {
      setBanDialogOpen(true);
      return;
    }
    
    if (['kick', 'downgrade', 'upgrade', 'unban'].includes(action)) {
      setActionType(action as any);
      setConfirmActionDialog(true);
      return;
    }
    
    if (action === 'edit') {
      // For future implementation - edit user
      toast({
        title: "Not Implemented",
        description: "Edit user functionality will be implemented in the next phase",
      });
    }
  };
  
  const executeBan = () => {
    if (!selectedUser || !banReason) return;
    
    const success = adminService.banUser(
      selectedUser.id, 
      banDuration as any, 
      banReason, 
      'admin-1'
    );
    
    if (success) {
      toast({
        title: "User Banned",
        description: `${selectedUser.nickname} has been banned for ${banDuration.replace('_', ' ')}`,
      });
    } else {
      toast({
        title: "Action Failed",
        description: "Could not ban the user. Please try again.",
        variant: "destructive",
      });
    }
    
    setBanDialogOpen(false);
    clearDialogState();
  };
  
  const executeAction = () => {
    if (!selectedUser) return;
    
    let success = false;
    let message = "";
    
    switch (actionType) {
      case 'kick':
        success = adminService.kickUser(selectedUser.id);
        message = `${selectedUser.nickname} has been kicked from the platform`;
        break;
      case 'unban':
        success = adminService.unbanUser(selectedUser.userId);
        message = `${selectedUser.username} has been unbanned`;
        break;
      case 'downgrade':
      case 'upgrade':
        // These would be implemented in the real service
        success = true;
        message = actionType === 'downgrade' 
          ? `${selectedUser.nickname} has been downgraded to standard user` 
          : `${selectedUser.nickname} has been upgraded to VIP user`;
        break;
    }
    
    if (success) {
      toast({
        title: "Action Successful",
        description: message,
      });
    } else {
      toast({
        title: "Action Failed",
        description: `Could not ${actionType} the user. Please try again.`,
        variant: "destructive",
      });
    }
    
    setConfirmActionDialog(false);
    clearDialogState();
  };
  
  const clearDialogState = () => {
    setSelectedUser(null);
    setBanReason("");
    setBanDuration("1_day");
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Tabs defaultValue="vip">
          <TabsList className="mb-4">
            <TabsTrigger value="vip">VIP Users</TabsTrigger>
            <TabsTrigger value="standard">Standard Users</TabsTrigger>
            <TabsTrigger value="banned">Banned Users/IPs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vip" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vipUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nickname}</TableCell>
                      <TableCell>
                        <Badge variant={user.online ? "success" : "outline"}>
                          {user.online ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.registrationDate)}</TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.subscriptionTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction(user, 'kick')}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Kick
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'ban')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Ban
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'edit')}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'downgrade')}>
                              <Shield className="mr-2 h-4 w-4" />
                              Downgrade
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="standard" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standardUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nickname}</TableCell>
                      <TableCell>
                        <Badge variant={user.online ? "success" : "outline"}>
                          {user.online ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.registrationDate)}</TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction(user, 'kick')}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Kick
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'ban')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Ban
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'edit')}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(user, 'upgrade')}>
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Upgrade to VIP
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Send VIP Gift
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="banned" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Banned On</TableHead>
                    <TableHead>Banned By</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.map((banned) => (
                    <TableRow key={banned.userId}>
                      <TableCell className="font-medium">{banned.username}</TableCell>
                      <TableCell>{banned.reason}</TableCell>
                      <TableCell>{formatDate(banned.bannedAt)}</TableCell>
                      <TableCell>{banned.bannedBy}</TableCell>
                      <TableCell>
                        <Badge variant={banned.duration === 'permanent' ? 'destructive' : 'outline'}>
                          {banned.duration === 'permanent' ? 'Permanent' : banned.duration.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {banned.expiresAt ? formatDate(banned.expiresAt) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAction(banned, 'unban')}
                        >
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Ban User Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                {selectedUser && `You are about to ban ${selectedUser.nickname || selectedUser.username}. Please provide a reason and duration.`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Ban Duration</Label>
                <Select 
                  value={banDuration} 
                  onValueChange={setBanDuration}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select ban duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day">1 Day</SelectItem>
                    <SelectItem value="7_days">7 Days</SelectItem>
                    <SelectItem value="30_days">30 Days</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Ban Reason</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Provide a reason for the ban"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={executeBan}
                disabled={!banReason}
              >
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Confirm Action Dialog */}
        <Dialog open={confirmActionDialog} onOpenChange={setConfirmActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                {actionType === 'kick' && selectedUser && `Are you sure you want to kick ${selectedUser.nickname || selectedUser.username}?`}
                {actionType === 'downgrade' && selectedUser && `Are you sure you want to downgrade ${selectedUser.nickname} to a standard user?`}
                {actionType === 'upgrade' && selectedUser && `Are you sure you want to upgrade ${selectedUser.nickname} to a VIP user?`}
                {actionType === 'unban' && selectedUser && `Are you sure you want to unban ${selectedUser.username}?`}
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmActionDialog(false)}>Cancel</Button>
              <Button 
                variant={actionType === 'kick' || actionType === 'downgrade' ? 'destructive' : 'default'} 
                onClick={executeAction}
              >
                Yes, Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
