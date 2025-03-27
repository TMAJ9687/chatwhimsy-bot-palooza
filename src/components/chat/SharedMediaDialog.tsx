
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
import { X, Image, Mic } from 'lucide-react';
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
const MediaImage = memo(({ msg, userName }: { msg: Message, userName: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Placeholder for unloaded or error images
  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E";
  
  return (
    <div key={msg.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 media-item">
      <img 
        src={hasError ? placeholder : msg.content} 
        alt="Shared media" 
        className={`w-full h-full object-cover transition-opacity duration-200 chat-image ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy" 
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{ 
          backgroundImage: `url(${placeholder})`,
          backgroundSize: 'cover'
        }}
      />
      {isLoaded && (
        <div className="absolute bottom-0 right-0 text-xs bg-black/50 text-white px-1 py-0.5 rounded-tl-md">
          {new Date(msg.timestamp).toLocaleDateString()}
        </div>
      )}
    </div>
  );
});

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

// Optimized component with windowing and pagination
const SharedMediaDialog: React.FC<SharedMediaDialogProps> = ({
  isOpen,
  onClose,
  media,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState('images');
  const [imagePage, setImagePage] = useState(1);
  const [voicePage, setVoicePage] = useState(1);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Performance tracking refs
  const animationFrameRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Cache for rendered items to prevent thrashing
  const renderedImagesCache = useRef<React.ReactNode[]>([]);
  const renderedVoiceCache = useRef<React.ReactNode[]>([]);
  
  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Reset state when dialog opens or media changes
  useEffect(() => {
    if (isOpen) {
      // Reset pagination
      setImagePage(1);
      setVoicePage(1);
      setIsInitialRender(true);
      
      // Add performance marking for debugging
      performance.mark('shared_media_open');
      
      // Stagger the content rendering for better performance
      setTimeout(() => {
        setIsInitialRender(false);
      }, 50);
      
      return () => {
        // Clean up and measure performance
        performance.mark('shared_media_close');
        performance.measure('Shared Media Dialog Session', 'shared_media_open', 'shared_media_close');
        
        // Clear content cache on close
        renderedImagesCache.current = [];
        renderedVoiceCache.current = [];
        
        // Clean up any pending animation frames
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [isOpen, media]);
  
  // Memoize pagination calculations
  const { 
    totalImagePages,
    totalVoicePages,
    currentImages,
    currentVoice,
    visibleImagePages,
    visibleVoicePages
  } = React.useMemo(() => {
    const { images, voice } = media;
    
    // Calculate pagination values
    const totalImagePages = Math.ceil(images.length / IMAGES_PER_PAGE);
    const totalVoicePages = Math.ceil(voice.length / VOICE_PER_PAGE);
    
    // Get current page items with proper slicing
    const currentImages = images.slice(
      (imagePage - 1) * IMAGES_PER_PAGE, 
      imagePage * IMAGES_PER_PAGE
    );
    
    const currentVoice = voice.slice(
      (voicePage - 1) * VOICE_PER_PAGE, 
      voicePage * VOICE_PER_PAGE
    );
    
    // Calculate visible page links (show 3 pages centered around current)
    const getVisiblePages = (currentPage: number, totalPages: number) => {
      if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      if (currentPage <= 2) {
        return [1, 2, 3];
      }
      
      if (currentPage >= totalPages - 1) {
        return [totalPages - 2, totalPages - 1, totalPages];
      }
      
      return [currentPage - 1, currentPage, currentPage + 1];
    };
    
    const visibleImagePages = getVisiblePages(imagePage, totalImagePages);
    const visibleVoicePages = getVisiblePages(voicePage, totalVoicePages);
    
    return {
      totalImagePages,
      totalVoicePages,
      currentImages,
      currentVoice,
      visibleImagePages,
      visibleVoicePages
    };
  }, [media, imagePage, voicePage]);
  
  // Optimized tab change handler
  const handleTabChange = useCallback((value: string) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setActiveTab(value);
    });
  }, []);
  
  // Optimized close handler with requestAnimationFrame
  const handleClose = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      onClose();
    });
  }, [onClose]);
  
  // Optimized page change handlers with requestAnimationFrame
  const handleImagePageChange = useCallback((newPage: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setImagePage(newPage);
      
      // Scroll to top when page changes
      if (dialogRef.current) {
        dialogRef.current.scrollTo(0, 0);
      }
    });
  }, []);
  
  const handleVoicePageChange = useCallback((newPage: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setVoicePage(newPage);
      
      // Scroll to top when page changes
      if (dialogRef.current) {
        dialogRef.current.scrollTo(0, 0);
      }
    });
  }, []);
  
  // Cache rendered content for better performance
  useEffect(() => {
    if (!isInitialRender) {
      // Cache image grid
      renderedImagesCache.current = currentImages.map((msg) => (
        <MediaImage key={msg.id} msg={msg} userName={userName} />
      ));
      
      // Cache voice messages
      renderedVoiceCache.current = currentVoice.map((msg) => (
        <VoiceMessage key={msg.id} msg={msg} userName={userName} />
      ));
    }
  }, [currentImages, currentVoice, userName, isInitialRender]);
  
  // Don't render anything if dialog isn't open
  if (!isOpen) return null;
  
  // Render pagination UI
  const renderPagination = (
    currentPage: number, 
    totalPages: number, 
    visiblePages: number[], 
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)} 
              />
            </PaginationItem>
          )}
          
          {visiblePages.map(pageNum => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={pageNum === currentPage}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        ref={dialogRef}
        className="sm:max-w-[500px] max-h-[80vh] overflow-hidden will-change-transform hardware-accelerated"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shared Media with {userName}</span>
            <button 
              onClick={handleClose} 
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription>
            View all shared photos and voice messages in this conversation.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="images" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
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
          
          {!isInitialRender && (
            <>
              <TabsContent value="images" className="mt-4">
                {media.images.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No shared photos in this conversation.
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px] pr-4 virtual-scroll-container">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 optimize-rendering">
                        {renderedImagesCache.current}
                      </div>
                    </ScrollArea>
                    
                    {renderPagination(
                      imagePage, 
                      totalImagePages, 
                      visibleImagePages, 
                      handleImagePageChange
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="voice" className="mt-4">
                {media.voice.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No voice messages in this conversation.
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px] virtual-scroll-container">
                      <div className="space-y-4 optimize-rendering">
                        {renderedVoiceCache.current}
                      </div>
                    </ScrollArea>
                    
                    {renderPagination(
                      voicePage, 
                      totalVoicePages, 
                      visibleVoicePages, 
                      handleVoicePageChange
                    )}
                  </>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Add CSS class to improve rendering performance
const OptimizedSharedMediaDialog = memo(SharedMediaDialog);

// Add display name for debugging
OptimizedSharedMediaDialog.displayName = 'SharedMediaDialog';

export default OptimizedSharedMediaDialog;
