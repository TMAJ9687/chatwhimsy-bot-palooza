
import React, { useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateImage } from '@/utils/messageUtils';

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

  const handleClick = () => {
    if (disabled) return;
    
    // Check if non-VIP user has images remaining
    if (!isVip && imagesRemaining <= 0) {
      toast({
        title: "Image limit reached",
        description: "You've used all your free images. Upgrade to VIP for unlimited image sharing.",
        duration: 5000
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate the file
    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        title: "Invalid image",
        description: validation.error,
        duration: 3000
      });
      return;
    }

    // Convert the file to a Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
    
    // Reset the file input to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
          disabled 
            ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        title={
          !isVip && imagesRemaining <= 0
            ? `Image limit reached. Upgrade to VIP for unlimited images.`
            : `Send an image${!isVip ? ` (${imagesRemaining} remaining)` : ''}`
        }
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploadButton;
