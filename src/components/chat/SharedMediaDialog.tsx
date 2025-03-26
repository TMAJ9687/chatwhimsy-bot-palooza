
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from '@/types/chat';
import { Image, Mic, X } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<string>('photos');
  
  // Filter messages for media
  const imageMessages = messages.filter(msg => msg.isImage && !msg.isGif);
  const gifMessages = messages.filter(msg => msg.isGif);
  const voiceMessages = messages.filter(msg => msg.isVoiceMessage);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Shared Media with {botName}</DialogTitle>
          <DialogClose className="h-4 w-4 opacity-70" asChild>
            <button className="rounded-full h-6 w-6 inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </DialogHeader>
        
        <Tabs defaultValue="photos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="photos" className="flex items-center gap-1.5">
              <Image className="h-4 w-4" />
              <span>Photos</span>
              {imageMessages.length > 0 && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">{imageMessages.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="gifs" className="flex items-center gap-1.5">
              <span>GIFs</span>
              {gifMessages.length > 0 && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">{gifMessages.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1.5">
              <Mic className="h-4 w-4" />
              <span>Voice</span>
              {voiceMessages.length > 0 && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">{voiceMessages.length}</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="max-h-[60vh] overflow-y-auto">
            {imageMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No photos shared yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imageMessages.map(msg => (
                  <div key={msg.id} className="aspect-square rounded-md overflow-hidden">
                    <img
                      src={msg.content}
                      alt="Shared image"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gifs" className="max-h-[60vh] overflow-y-auto">
            {gifMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No GIFs shared yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gifMessages.map(msg => (
                  <div key={msg.id} className="aspect-square rounded-md overflow-hidden">
                    <img
                      src={msg.content}
                      alt="Shared GIF"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="max-h-[60vh] overflow-y-auto">
            {voiceMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No voice messages shared yet
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {voiceMessages.map(msg => (
                  <div key={msg.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <audio controls className="w-full">
                      <source src={msg.content} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
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
