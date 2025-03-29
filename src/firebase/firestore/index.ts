
// Re-export all firestore functionality from the modular files
export * from './utils';
export * from './botCollection';
export * from './banCollection';
export * from './adminActionCollection';
export * from './reportCollection';
export * from './userManagement';
export * from './dbUtils';
export * from './userProfiles';
export * from './chatHistory';

// Initialize function to ensure all firestore data is properly loaded
export const initializeFirestoreData = async (): Promise<void> => {
  console.log('Initializing Firestore data');
  
  // Import the utils to prevent circular dependencies
  const { ensureCollectionsExist } = await import('./utils');
  
  // Ensure all required collections exist
  await ensureCollectionsExist();
  
  return Promise.resolve();
};
