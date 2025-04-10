
import React, { useState, useEffect } from 'react';
import { Bot } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface UserEditFormProps {
  user: Bot;
  onSave: (updatedUser: Bot) => void;
  onCancel: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name || '');
  const [description, setDescription] = useState(user.description || '');
  const [isVip, setIsVip] = useState(user.vip || false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when user changes
  useEffect(() => {
    setName(user.name || '');
    setDescription(user.description || '');
    setIsVip(user.vip || false);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!name.trim()) {
        toast({
          title: 'Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Create updated user object with only the fields we want to update
      const updatedUser: Bot = {
        ...user,
        name,
        description,
        vip: isVip,
      };

      // Call the save function with the updated user
      onSave(updatedUser);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="User name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="User description"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isVip" 
          checked={isVip} 
          onCheckedChange={(checked) => setIsVip(checked === true)}
        />
        <Label htmlFor="isVip">VIP User</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserEditForm;
