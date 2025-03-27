
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Image, Mic, X } from 'lucide-react';
import { Message } from '@/types/chat';
import AudioPlayer from './AudioPlayer';

interface SharedMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  userName: string;
}

const SharedMediaDialog: React.FC<SharedMediaDialogProps> = ({
  isOpen,
  onClose,
  messages,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState('images');

  const imageMessages = messages.filter((message) => message.isImage);
  const voiceMessages = messages.filter((message) => message.isVoice);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shared Media with {userName}</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images" className="flex items-center">
              <Image className="h-4 w-4 mr-2" />
              Images ({imageMessages.length})
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              Voice ({voiceMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-4">
            {imageMessages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {imageMessages.map((message) => (
                  <div key={message.id} className="relative group">
                    <img
                      src={message.content}
                      alt="Shared image"
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white"
                        onClick={() => window.open(message.content, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No images shared in this conversation
              </div>
            )}
          </TabsContent>

          <TabsContent value="voice" className="mt-4">
            {voiceMessages.length > 0 ? (
              <div className="space-y-4">
                {voiceMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="text-sm text-muted-foreground">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                    <AudioPlayer src={message.content} duration={message.duration} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No voice messages in this conversation
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SharedMediaDialog;
