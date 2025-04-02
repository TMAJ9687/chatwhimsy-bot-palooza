
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Storage paths for different user types
const STANDARD_BUCKET = 'standard-uploads';
const VIP_BUCKET = 'vip-uploads';
const PROFILE_BUCKET = 'profile-images';

/**
 * Uploads an image to Supabase Storage
 * @param imageFile The image file or blob to upload
 * @param isVip Whether the user is a VIP
 * @param userId User ID to associate with the upload
 * @returns Promise with the download URL
 */
export const uploadImage = async (
  imageFile: File | Blob, 
  isVip: boolean = false,
  userId?: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for uploads');
    }
    
    // Generate a unique filename
    const fileExtension = getFileExtension(imageFile);
    const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
    
    // Determine the storage bucket based on user type
    const bucketId = isVip ? VIP_BUCKET : STANDARD_BUCKET;
    
    // Create the full path including user ID
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, imageFile, {
        contentType: imageFile instanceof File ? imageFile.type : 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading to Supabase:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketId)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Uploads a profile image
 * @param imageFile The image file to upload
 * @param userId User ID
 * @returns Promise with the download URL
 */
export const uploadProfileImage = async (
  imageFile: File | Blob, 
  userId: string
): Promise<string> => {
  try {
    const fileExtension = getFileExtension(imageFile);
    const fileName = `${userId}${fileExtension ? `.${fileExtension}` : ''}`;
    
    // Upload to profile images bucket
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(fileName, imageFile, {
        contentType: imageFile instanceof File ? imageFile.type : 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(PROFILE_BUCKET)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Uploads a base64 data URL as an image
 * @param dataUrl The data URL string
 * @param isVip Whether the user is a VIP
 * @param userId User ID
 * @returns Promise with the download URL
 */
export const uploadDataURLImage = async (
  dataUrl: string,
  isVip: boolean = false,
  userId?: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for uploads');
    }
    
    // Convert data URL to blob
    const blob = dataURLToBlob(dataUrl);
    
    // Upload the blob
    return await uploadImage(blob, isVip, userId);
  } catch (error) {
    console.error('Error uploading data URL image:', error);
    throw error;
  }
};

/**
 * Gets the extension from a File or Blob
 */
function getFileExtension(file: File | Blob): string | null {
  if (file instanceof File) {
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
  }
  
  // For blobs, try to determine from type
  const mimeType = file.type;
  if (mimeType.startsWith('image/')) {
    return mimeType.split('/')[1] || null;
  }
  
  return null;
}

/**
 * Converts a data URL to a Blob
 */
function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Lists all images for a user
 * @param userId User ID
 * @param isVip Whether the user is a VIP
 * @returns Promise with array of download URLs
 */
export const listUserImages = async (
  userId: string,
  isVip: boolean = false
): Promise<string[]> => {
  try {
    const bucketId = isVip ? VIP_BUCKET : STANDARD_BUCKET;
    
    // List files in the user's folder
    const { data, error } = await supabase.storage
      .from(bucketId)
      .list(`${userId}`);
    
    if (error) {
      console.error('Error listing user images:', error);
      return [];
    }
    
    // Get public URLs for all files
    const urls = data.map(file => {
      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(`${userId}/${file.name}`);
      
      return urlData.publicUrl;
    });
    
    return urls;
  } catch (error) {
    console.error('Error listing user images:', error);
    return [];
  }
};

/**
 * Gets the profile image URL for a user
 * @param userId User ID
 * @returns Promise with the download URL or null if not found
 */
export const getProfileImageUrl = async (userId: string): Promise<string | null> => {
  try {
    // List all files in the profile-images bucket
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .list();
    
    if (error) {
      console.error('Error listing profile images:', error);
      return null;
    }
    
    // Find files that match the userId pattern
    const userFile = data.find(file => file.name.startsWith(userId));
    
    if (userFile) {
      const { data: urlData } = supabase.storage
        .from(PROFILE_BUCKET)
        .getPublicUrl(userFile.name);
      
      return urlData.publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param fileUrl The public URL of the file to delete
 * @param isVip Whether the user is a VIP
 * @param userId User ID
 * @returns Promise<boolean> indicating success
 */
export const deleteImage = async (
  fileUrl: string,
  isVip: boolean = false,
  userId?: string
): Promise<boolean> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for deleting files');
    }
    
    // Extract the file path from the URL
    const bucketId = isVip ? VIP_BUCKET : STANDARD_BUCKET;
    const path = getPathFromUrl(fileUrl, bucketId);
    
    if (!path) {
      console.error('Could not extract path from URL:', fileUrl);
      return false;
    }
    
    // Delete the file
    const { error } = await supabase.storage
      .from(bucketId)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Helper to extract path from Supabase Storage URL
 */
function getPathFromUrl(url: string, bucketId: string): string | null {
  try {
    // Extract the path from the URL
    // Example URL: https://example.com/storage/v1/object/public/bucket/path/to/file.jpg
    const regex = new RegExp(`/storage/v1/object/public/${bucketId}/(.+)`);
    const match = url.match(regex);
    
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}
