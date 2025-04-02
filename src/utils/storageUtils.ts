
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a data URL image to Supabase Storage
 * @param dataUrl Base64 data URL of the image
 * @param isVip Flag indicating if user is VIP to determine bucket
 * @param userId User ID for the file path
 * @returns URL of the uploaded file
 */
export const uploadDataURLImage = async (
  dataUrl: string,
  isVip: boolean = false,
  userId: string
): Promise<string> => {
  try {
    // Convert data URL to File object
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    
    // Determine file type and create unique filename
    const fileType = blob.type.split('/')[1] || 'png';
    const fileName = `${uuidv4()}.${fileType}`;
    
    // Determine which bucket to use based on user role
    const bucketName = isVip ? 'vip-uploads' : 'standard-uploads';
    
    // Define file path - organize by user ID and date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = `${userId}/${date}/${fileName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
};

/**
 * Upload a profile image to Supabase Storage
 * @param file Image file to upload
 * @param userId User ID for the file path
 * @returns URL of the uploaded file
 */
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    // Determine file type and create unique filename
    const fileType = file.type.split('/')[1] || 'png';
    const fileName = `${uuidv4()}.${fileType}`;
    
    // Use profile-images bucket for all profile images
    const bucketName = 'profile-images';
    
    // Define file path
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true // Replace if exists
      });
    
    if (error) {
      console.error('Supabase profile image upload error:', error);
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile image to Supabase:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param url Full URL of the image to delete
 * @param isVip Flag indicating if user is VIP to determine bucket
 * @returns Boolean indicating success
 */
export const deleteImage = async (
  url: string,
  isVip: boolean = false
): Promise<boolean> => {
  try {
    // Determine which bucket based on user role
    const bucketName = isVip ? 'vip-uploads' : 'standard-uploads';
    
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf(bucketName) + 1).join('/');
    
    // Delete from Supabase
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase storage delete error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    return false;
  }
};
