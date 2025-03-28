
import React from 'react';
import { Button } from '../ui/button';
import { X, Send } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  onCancel: () => void;
  onSend: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onCancel, onSend }) => {
  return (
    <div className="mb-3 mx-3 relative">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <img
          src={src}
          alt="Preview"
          className="h-36 object-contain rounded-lg border border-border dark:border-gray-600 max-w-full"
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="rounded-full p-1 h-8 w-8 bg-white dark:bg-gray-800 shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={onSend}
            className="rounded-full p-1 h-8 w-8 bg-amber-500 hover:bg-amber-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
