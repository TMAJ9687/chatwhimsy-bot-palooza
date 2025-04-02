
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to help migrate data from Firebase to Supabase
 */
export async function migrateImageToSupabase(
  dataUrl: string, 
  userId: string,
  isVip: boolean = false
): Promise<string | null> {
  try {
    // Convert data URL to file
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    
    // Generate a unique filename
    const fileExt = getFileExtension(blob.type);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
    
    // Determine the correct bucket based on user type
    const bucketId = isVip ? 'vip-uploads' : 'standard-uploads';
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading to Supabase:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketId)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Migration error:', error);
    return null;
  }
}

/**
 * Helper to get file extension from mime type
 */
function getFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };
  
  return map[mimeType] || '.jpg';
}

/**
 * Migrate profile image to Supabase
 */
export async function migrateProfileImageToSupabase(
  dataUrl: string,
  userId: string
): Promise<string | null> {
  try {
    // Convert data URL to file
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    
    // Generate a filename based on user ID
    const fileExt = getFileExtension(blob.type);
    const fileName = `${userId}${fileExt}`;
    
    // Upload to the profile-images bucket
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading profile image to Supabase:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Profile image migration error:', error);
    return null;
  }
}
