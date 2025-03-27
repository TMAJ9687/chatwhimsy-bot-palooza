
import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
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
import { X, Image, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';

interface SharedMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    images: Message[];
    voice: Message[];
  };
  userName: string;
}

// Memoized image component for better performance
const MediaImage = memo(({ msg, userName }: { msg: Message, userName: string }) => (
  <div key={msg.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 media-item">
    <img 
      src={msg.content} 
      alt="Shared media" 
      className="w-full h-full object-cover"
      loading="lazy" // Add lazy loading
      decoding="async" // Add async decoding
    />
    <div className="absolute bottom-0 right-0 text-xs bg-black/50 text-white px-1 py-0.5 rounded-tl-md">
      {new Date(msg.timestamp).toLocaleDateString()}
    </div>
  </div>
));

MediaImage.displayName = 'MediaImage';

// Memoized voice component for better performance
const VoiceMessage = memo(({ msg, userName }: { msg: Message, userName: string }) => (
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
));

VoiceMessage.displayName = 'VoiceMessage';

// Page size constants
const IMAGES_PER_PAGE = 9;
const VOICE_PER_PAGE = 5;

const SharedMediaDialog: React.FC<SharedMediaDialogProps> = ({
  isOpen,
  onClose,
  media,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState('images');
  const [imagePage, setImagePage] = useState(1);
  const [voicePage, setVoicePage] = useState(1);
  
  // Reset pagination when dialog opens or media changes
  useEffect(() => {
    if (isOpen) {
      setImagePage(1);
      setVoicePage(1);
      
      // Add performance marking for debugging
      performance.mark('shared_media_open');
      
      return () => {
        performance.mark('shared_media_close');
        performance.measure('Shared Media Dialog Session', 'shared_media_open', 'shared_media_close');
      };
    }
  }, [isOpen, media]);
  
  // Optimized close handler with useCallback
  const handleClose = useCallback(() => {
    // Use requestAnimationFrame to prevent UI freeze
    requestAnimationFrame(() => {
      onClose();
    });
  }, [onClose]);

  // Don't render anything if dialog isn't open
  if (!isOpen) return null;

  // Extract media into batches for efficient rendering
  const { images, voice } = media;
  
  // Calculate pagination values
  const totalImagePages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const totalVoicePages = Math.ceil(voice.length / VOICE_PER_PAGE);
  
  // Get current page items
  const currentImages = images.slice(
    (imagePage - 1) * IMAGES_PER_PAGE, 
    imagePage * IMAGES_PER_PAGE
  );
  
  const currentVoice = voice.slice(
    (voicePage - 1) * VOICE_PER_PAGE, 
    voicePage * VOICE_PER_PAGE
  );
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden will-change-transform">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shared Media with {userName}</span>
            <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription>
            View all shared photos and voice messages in this conversation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="images" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="images" className="flex items-center gap-1 w-1/2">
              <Image className="h-4 w-4" />
              <span>Photos ({images.length})</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1 w-1/2">
              <Mic className="h-4 w-4" />
              <span>Voice Messages ({voice.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="mt-4">
            {images.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No shared photos in this conversation.
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentImages.map((msg) => (
                      <MediaImage key={msg.id} msg={msg} userName={userName} />
                    ))}
                  </div>
                </ScrollArea>
                
                {totalImagePages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      {imagePage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setImagePage(prev => Math.max(prev - 1, 1))} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(3, totalImagePages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum = imagePage;
                        if (imagePage === 1) {
                          pageNum = i + 1;
                        } else if (imagePage === totalImagePages) {
                          pageNum = totalImagePages - 2 + i;
                        } else {
                          pageNum = imagePage - 1 + i;
                        }
                        
                        // Ensure page is in valid range
                        if (pageNum < 1 || pageNum > totalImagePages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={pageNum === imagePage}
                              onClick={() => setImagePage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {imagePage < totalImagePages && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setImagePage(prev => Math.min(prev + 1, totalImagePages))} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="mt-4">
            {voice.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No voice messages in this conversation.
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {currentVoice.map((msg) => (
                      <VoiceMessage key={msg.id} msg={msg} userName={userName} />
                    ))}
                  </div>
                </ScrollArea>
                
                {totalVoicePages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      {voicePage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setVoicePage(prev => Math.max(prev - 1, 1))} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(3, totalVoicePages) }, (_, i) => {
                        let pageNum = voicePage;
                        if (voicePage === 1) {
                          pageNum = i + 1;
                        } else if (voicePage === totalVoicePages) {
                          pageNum = totalVoicePages - 2 + i;
                        } else {
                          pageNum = voicePage - 1 + i;
                        }
                        
                        if (pageNum < 1 || pageNum > totalVoicePages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={pageNum === voicePage}
                              onClick={() => setVoicePage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {voicePage < totalVoicePages && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setVoicePage(prev => Math.min(prev + 1, totalVoicePages))} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Add CSS class to improve rendering performance
const StyledSharedMediaDialog = memo(SharedMediaDialog);

// Add display name for debugging
StyledSharedMediaDialog.displayName = 'SharedMediaDialog';

export default StyledSharedMediaDialog;
