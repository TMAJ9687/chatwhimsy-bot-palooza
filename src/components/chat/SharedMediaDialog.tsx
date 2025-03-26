
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Image, Mic, X } from 'lucide-react';
import { Message } from '@/types/chat';

interface SharedMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  botName: string;
}

const SharedMediaDialog: React.FC<SharedMediaDialogProps> = ({
  isOpen,
  onClose,
  messages,
  botName
}) => {
  const [activeTab, setActiveTab] = useState('images');
  
  // Filter messages to get only images and voice messages
  const images = messages.filter(msg => msg.isImage);
  const voiceMessages = messages.filter(msg => msg.isVoiceMessage);
  
  const handleDownload = (url: string, type: 'image' | 'audio') => {
    const extension = type === 'image' ? 'jpg' : 'webm';
    const filename = `${botName}-${new Date().getTime()}.${extension}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Shared Media with {botName}</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="images" className="flex-1">
                <Image className="h-4 w-4 mr-2" />
                Images ({images.length})
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex-1">
                <Mic className="h-4 w-4 mr-2" />
                Voice Messages ({voiceMessages.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="images" className="mt-4">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((msg) => (
                    <div key={msg.id} className="relative group">
                      <img 
                        src={msg.content} 
                        alt="Shared image" 
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-white"
                          onClick={() => handleDownload(msg.content, 'image')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No images shared yet
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="voice" className="mt-4">
              {voiceMessages.length > 0 ? (
                <div className="space-y-3">
                  {voiceMessages.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <audio controls className="w-3/4">
                        <source src={msg.content} type="audio/webm" />
                        Your browser does not support the audio element.
                      </audio>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDownload(msg.content, 'audio')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No voice messages shared yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharedMediaDialog;
