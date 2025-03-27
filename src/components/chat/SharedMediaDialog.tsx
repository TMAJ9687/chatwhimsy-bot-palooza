
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Message } from '@/types/chat';
import { ScrollArea } from '../ui/scroll-area';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { X, Image, Mic } from 'lucide-react';

interface SharedMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    images: Message[];
    voice: Message[];
  };
  userName: string;
}

const SharedMediaDialog: React.FC<SharedMediaDialogProps> = ({
  isOpen,
  onClose,
  media,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState('images');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shared Media with {userName}</span>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription>
            View all shared photos and voice messages in this conversation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="images" className="flex items-center gap-1 w-1/2">
              <Image className="h-4 w-4" />
              <span>Photos ({media.images.length})</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1 w-1/2">
              <Mic className="h-4 w-4" />
              <span>Voice Messages ({media.voice.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="mt-4">
            {media.images.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No shared photos in this conversation.
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {media.images.map((msg) => (
                    <div key={msg.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={msg.content} 
                        alt="Shared media" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 text-xs bg-black/50 text-white px-1 py-0.5 rounded-tl-md">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="mt-4">
            {media.voice.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No voice messages in this conversation.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {media.voice.map((msg) => (
                    <div key={msg.id} className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{msg.sender === 'user' ? 'You' : userName}</span>
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <VoiceMessagePlayer 
                        audioSrc={msg.content} 
                        duration={msg.duration || 0}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SharedMediaDialog;
