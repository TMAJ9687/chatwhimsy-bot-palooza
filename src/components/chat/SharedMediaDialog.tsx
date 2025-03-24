
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Image, Mic, X } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { Message } from './MessageBubble';

interface SharedMediaProps {
  messages: Message[];
  contactName: string;
}

const SharedMediaDialog: React.FC<SharedMediaProps> = ({ messages, contactName }) => {
  const { state, closeDialog } = useDialog();
  const [activeTab, setActiveTab] = useState<'images' | 'voice'>('images');
  
  // Filter messages to get images and voice messages
  const imageMessages = messages.filter(msg => msg.isImage);
  const voiceMessages = messages.filter(msg => msg.isVoice);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'images' | 'voice');
  };
  
  // Check if dialog is not open, return null
  if (!state.isOpen || state.type !== 'sharedMedia') {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shared Media with {contactName}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeDialog}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="images" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images" className="flex items-center">
              <Image className="h-4 w-4 mr-2" />
              <span>Images</span>
              <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">
                {imageMessages.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              <span>Voice</span>
              <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">
                {voiceMessages.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="mt-4">
            {imageMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Image className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No images shared yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imageMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className="aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <img 
                      src={message.content}
                      alt="Shared media"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="mt-4">
            {voiceMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Mic className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No voice messages shared yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {voiceMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {message.isUser ? 'You' : message.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <audio 
                      controls 
                      src={message.voiceUrl} 
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SharedMediaDialog;
