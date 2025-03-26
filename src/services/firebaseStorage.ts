
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { makeSerializable, firebaseQueue } from '@/utils/serialization';

/**
 * Safely uploads an image file to Firebase Storage
 * @param userId User ID for the upload path
 * @param file File to upload
 * @param path Path within the user's storage
 * @returns Promise with the download URL
 */
export const uploadImage = async (userId: string, file: File, path: string): Promise<string> => {
  return firebaseQueue.add(async () => {
    try {
      // Ensure the file is actually an image
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Create safe file name
      const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${safeFileName}`;
      
      // Create storage reference with a safe path
      const storagePath = `${userId}/${path}/${uniqueFileName}`;
      const storageRef = ref(storage, storagePath);
      
      // Create serializable metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
          timestamp: new Date().toISOString()
        }
      };
      
      // Create a serializable version of the file if needed
      let uploadFile = file;
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, uploadFile, metadata);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Return just the string URL to avoid serialization issues
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw makeSerializable(error);
    }
  });
};

/**
 * Process raw files to ensure they are serializable
 * Useful for handling File objects before passing to Firestore
 */
export const prepareFileForUpload = (file: File): {
  name: string;
  type: string;
  size: number;
  lastModified: number;
} => {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };
};
