
// This file now redirects all Firebase Storage operations to Supabase Storage
import { supabase } from '../lib/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Storage paths for different user types (for compatibility)
const STANDARD_USERS_PATH = 'standard-uploads';
const VIP_USERS_PATH = 'vip-uploads'; 
const PROFILE_IMAGES_PATH = 'profile-images';
const TEMPORARY_PATH = 'temp-uploads';

/**
 * Uploads an image to Supabase Storage
 */
export const uploadImage = async (
  imageFile: File | Blob, 
  isVip: boolean = false,
  userId?: string
): Promise<string> => {
  try {
    // Generate a unique filename
    const fileExtension = getFileExtension(imageFile);
    const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
    
    // Determine the storage path based on user type
    const storagePath = isVip ? VIP_USERS_PATH : STANDARD_USERS_PATH;
    
    // Add user ID to path if provided
    const fullPath = userId 
      ? `${storagePath}/${userId}/${fileName}`
      : `${storagePath}/${fileName}`;
    
    // Upload the file to Supabase storage
    let file: File;
    if (imageFile instanceof Blob) {
      file = new File([imageFile], fileName, { type: imageFile.type });
    } else {
      file = imageFile;
    }
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fullPath, file);
      
    if (error) throw error;
    
    // Get the download URL
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(fullPath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Uploads a profile image
 */
export const uploadProfileImage = async (
  imageFile: File | Blob, 
  userId: string
): Promise<string> => {
  try {
    const fileExtension = getFileExtension(imageFile);
    const fileName = `${userId}${fileExtension ? `.${fileExtension}` : ''}`;
    const fullPath = `${PROFILE_IMAGES_PATH}/${fileName}`;
    
    // Convert blob to file if needed
    let file: File;
    if (imageFile instanceof Blob) {
      file = new File([imageFile], fileName, { type: imageFile.type });
    } else {
      file = imageFile;
    }
    
    // Upload the file
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fullPath, file);
      
    if (error) throw error;
    
    // Get the download URL
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(fullPath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Convert base64 data URL to image and upload
export const uploadDataURLImage = async (
  dataUrl: string,
  isVip: boolean = false,
  userId?: string
): Promise<string> => {
  try {
    // Convert data URL to blob
    const blob = dataURLToBlob(dataUrl);
    
    // Upload the blob
    return await uploadImage(blob, isVip, userId);
  } catch (error) {
    console.error('Error uploading data URL image:', error);
    throw error;
  }
};

// Utility function to get file extension
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

// Convert a data URL to a Blob
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

// List user images
export const listUserImages = async (
  userId: string,
  isVip: boolean = false
): Promise<string[]> => {
  try {
    const storagePath = isVip ? VIP_USERS_PATH : STANDARD_USERS_PATH;
    const folderPath = `${storagePath}/${userId}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .list(folderPath);
      
    if (error) throw error;
    if (!data) return [];
    
    // Map to full URLs
    return data.map(item => {
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(`${folderPath}/${item.name}`);
      return data.publicUrl;
    });
  } catch (error) {
    console.error('Error listing user images:', error);
    return [];
  }
};

// Get profile image URL
export const getProfileImageUrl = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .list(PROFILE_IMAGES_PATH);
      
    if (error) throw error;
    if (!data) return null;
    
    // Find files that start with userId
    const userProfileImages = data.filter(item => 
      item.name.startsWith(userId)
    );
    
    if (userProfileImages.length > 0) {
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(`${PROFILE_IMAGES_PATH}/${userProfileImages[0].name}`);
      return data.publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

// Delete an image
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const path = getPathFromUrl(imageUrl);
    
    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from('uploads')
      .remove([path]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Helper to extract path from URL
function getPathFromUrl(url: string): string {
  // Extract the file path from Supabase URL
  const match = url.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: just use the last part of the URL
  return url.split('/').pop() || '';
}
