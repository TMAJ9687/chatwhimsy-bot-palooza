
import React, { useState } from 'react';
import { Circle, CheckCircle2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot } from '@/types/chat';
import UserActionsButton from '@/components/admin/UserActionsButton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';

interface BotsTabProps {
  bots: Bot[];
  onlineUsers: string[];
}

interface BotFormData {
  name: string;
  age: number;
  gender: string;
  country: string;
  vip: boolean;
}

const BotsTab: React.FC<BotsTabProps> = ({ bots, onlineUsers }) => {
  const { toast } = useToast();
  const { createBot } = useAdmin(); // Make sure createBot is correctly destructured
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    age: 25,
    gender: 'female',
    country: 'us',
    vip: false,
  });

  const handleAddBot = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Bot name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const newBot = await createBot({
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        country: formData.country,
        vip: formData.vip,
        avatar: "🤖",
        responses: ["Hello there!", "Nice to meet you!"],
      });
      
      if (newBot) {
        toast({
          title: "Bot created",
          description: `Bot "${formData.name}" has been created successfully`
        });
        
        setIsAddDialogOpen(false);
        
        setFormData({
          name: '',
          age: 25,
          gender: 'female',
          country: 'us',
          vip: false,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create bot",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        title: "Error",
        description: "Failed to create bot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage AI chat bots, customize their profiles and responses.</p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>VIP</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.map((bot: Bot) => (
              <TableRow key={bot.id}>
                <TableCell>{bot.avatar}</TableCell>
                <TableCell className="font-medium">{bot.name}</TableCell>
                <TableCell>
                  {onlineUsers && onlineUsers.includes(bot.id) ? (
                    <span className="flex items-center">
                      <Circle className="h-3 w-3 fill-green-500 text-green-500 mr-1" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Circle className="h-3 w-3 fill-gray-300 text-gray-300 mr-1" />
                      Offline
                    </span>
                  )}
                </TableCell>
                <TableCell>{bot.age}</TableCell>
                <TableCell>{bot.gender}</TableCell>
                <TableCell>{bot.country}</TableCell>
                <TableCell>
                  {bot.vip ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <UserActionsButton user={bot} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Bot
          </Button>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bot</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: Number(e.target.value) || 18})}
                  min="18"
                  max="99"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                >
                  <SelectTrigger id="gender" className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vip" className="text-right">
                  VIP Status
                </Label>
                <Select
                  value={formData.vip ? "true" : "false"}
                  onValueChange={(value) => setFormData({...formData, vip: value === "true"})}
                >
                  <SelectTrigger id="vip" className="col-span-3">
                    <SelectValue placeholder="Select VIP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">VIP</SelectItem>
                    <SelectItem value="false">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddBot} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Bot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BotsTab;
