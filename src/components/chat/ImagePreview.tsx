
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
    <div className="mb-3 relative">
      <img
        src={src}
        alt="Preview"
        className="h-32 object-contain rounded-lg border border-border dark:border-gray-700"
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button 
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="rounded-full p-1 h-8 w-8"
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
  );
};

export default ImagePreview;
