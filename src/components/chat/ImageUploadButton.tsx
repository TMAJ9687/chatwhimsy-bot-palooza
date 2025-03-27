
import React, { useRef } from 'react';
import { Image } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/utils/messageUtils';

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

  const handleClickUpload = () => {
    if (disabled) return;
    
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.message
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      onImageSelected(result);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
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
