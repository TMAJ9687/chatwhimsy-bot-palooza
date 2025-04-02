
import React, { useRef } from 'react';
import { Image } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/utils/messageUtils';
import { uploadDataURLImage } from '@/utils/storageUtils';
import { useUser } from '@/context/UserContext';

interface ImageUploadButtonProps {
  onImageSelected: (imageDataUrl: string) => void;
  imagesRemaining: number;
  isVip: boolean;
  disabled?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onImageSelected,
  imagesRemaining,
  isVip,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleClickUpload = () => {
    if (disabled) return;
    
    // Standard users have upload limits
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check upload limits for standard users
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    // Pass isVip to validateImageFile to apply correct image type restrictions
    const validation = validateImageFile(file, isVip);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.message
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const result = reader.result as string;
        
        // First pass the data URL to onImageSelected to maintain compatibility
        onImageSelected(result);
        
        // In the background, upload to storage if user is logged in
        if (user?.id) {
          try {
            await uploadDataURLImage(result, isVip, user.id);
          } catch (error) {
            console.error('Error uploading to storage:', error);
            // Don't show error toast here since we already showed the image in chat
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={isVip ? "image/*" : "image/jpeg,image/png,image/webp"}
        onChange={handleImageUpload}
        disabled={disabled}
      />
      
      <Button 
        variant="ghost" 
        size="icon"
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
        onClick={handleClickUpload}
        disabled={disabled}
        title={
          isVip 
            ? "Upload image" 
            : `Upload image (${imagesRemaining} remaining today)`
        }
      >
        <Image className="h-5 w-5" />
      </Button>
    </>
  );
};

export default ImageUploadButton;
