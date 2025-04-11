
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import BotForm from '@/components/admin/bots/BotForm';
import BotListTable from '@/components/admin/bots/BotListTable';

interface BotsTabProps {
  bots: Bot[];
  onlineUsers: string[];
}

const BotsTab: React.FC<BotsTabProps> = ({ bots, onlineUsers }) => {
  const { toast } = useToast();
  const { createBot } = useAdmin();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);

  const handleAddBot = async (newBotData: Omit<Bot, 'id'>) => {
    try {
      const newBot = await createBot(newBotData);
      
      if (newBot) {
        toast({
          title: "Bot created",
          description: `Bot "${newBotData.name}" has been created successfully`
        });
        
        setIsAddDialogOpen(false);
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
    }
  };

  const handleEditBot = (bot: Bot) => {
    setEditingBot(bot);
    // Note: Edit functionality would be implemented here
    // For now we just notify that editing is not yet implemented
    toast({
      title: "Edit",
      description: "Edit functionality will be implemented soon"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage AI chat bots, customize their profiles and responses.</p>
        
        <BotListTable 
          bots={bots} 
          onlineUsers={onlineUsers}
          onEdit={handleEditBot}
        />
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Bot
          </Button>
        </div>

        <BotForm 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddBot}
        />
      </CardContent>
    </Card>
  );
};

export default BotsTab;
