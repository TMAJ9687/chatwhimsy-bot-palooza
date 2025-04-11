
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/types/chat';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BotFormData {
  name: string;
  age: number;
  gender: string;
  country: string;
  vip: boolean;
}

interface BotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bot: Omit<Bot, 'id'>) => Promise<void>;
}

const BotForm: React.FC<BotFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    age: 25,
    gender: 'female',
    country: 'us',
    vip: false,
  });

  const handleSubmit = async () => {
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
      
      // Create bot object with required fields
      const newBot: Omit<Bot, 'id'> = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        country: formData.country,
        countryCode: formData.country,
        vip: formData.vip,
        avatar: "🤖",
        responses: ["Hello there!", "Nice to meet you!"],
        interests: []
      };
      
      await onSubmit(newBot);
      
      // Reset form data
      setFormData({
        name: '',
        age: 25,
        gender: 'female',
        country: 'us',
        vip: false,
      });
    } catch (error) {
      console.error('Error submitting bot:', error);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BotForm;
