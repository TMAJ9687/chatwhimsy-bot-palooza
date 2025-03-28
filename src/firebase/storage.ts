
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';

// Storage paths for different user types
const STANDARD_USERS_PATH = 'standard-uploads';
const VIP_USERS_PATH = 'vip-uploads'; 
const PROFILE_IMAGES_PATH = 'profile-images';
const TEMPORARY_PATH = 'temp-uploads'; // For temporary storage

/**
 * Uploads an image to Firebase Storage
 * @param imageFile The image file or blob to upload
 * @param isVip Whether the user is a VIP
 * @param userId Optional user ID to associate with the upload
 * @returns Promise with the download URL
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
    
    // Create a storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    await uploadBytes(storageRef, imageFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
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
    const fullPath = `${PROFILE_IMAGES_PATH}/${fileName}`;
    
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    await uploadBytes(storageRef, imageFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Uploads a base64 data URL as an image
 * @param dataUrl The data URL string
 * @param isVip Whether the user is a VIP
 * @param userId Optional user ID
 * @returns Promise with the download URL
 */
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
    const storagePath = isVip ? VIP_USERS_PATH : STANDARD_USERS_PATH;
    const userFolderRef = ref(storage, `${storagePath}/${userId}`);
    
    const listResult = await listAll(userFolderRef);
    
    const downloadUrls = await Promise.all(
      listResult.items.map(itemRef => getDownloadURL(itemRef))
    );
    
    return downloadUrls;
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
    const profileImagesRef = ref(storage, PROFILE_IMAGES_PATH);
    const listResult = await listAll(profileImagesRef);
    
    // Find files that start with userId
    const userProfileImages = listResult.items.filter(item => 
      item.name.startsWith(userId)
    );
    
    if (userProfileImages.length > 0) {
      return await getDownloadURL(userProfileImages[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

/**
 * Deletes an image from Firebase Storage
 * @param imageUrl The download URL of the image to delete
 * @returns Promise<boolean> indicating success
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the storage path from the URL
    const storageRef = ref(storage, getPathFromUrl(imageUrl));
    
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Helper to extract path from Firebase Storage URL
 */
function getPathFromUrl(url: string): string {
  // This is a simplification - in a real app you might need more robust parsing
  // Firebase Storage URLs contain a token after the path
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/chatwiilovable.firebasestorage.app/o/";
  const pathPlusToken = url.replace(baseUrl, "");
  const path = pathPlusToken.split("?")[0];
  
  // URL decode the path (Firebase encodes paths in URLs)
  return decodeURIComponent(path);
}
