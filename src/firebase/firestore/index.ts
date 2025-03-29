
// Re-export all firestore functionality from the modular files
export * from './utils';
export * from './botCollection';
export * from './banCollection';
export * from './adminActionCollection';
export * from './reportCollection';
export * from './userManagement';
export * from './dbUtils';

// Initialize function to ensure all firestore data is properly loaded
export const initializeFirestoreData = async (): Promise<void> => {
  console.log('Initializing Firestore data');
  // This function can be expanded to preload essential data or run migrations
  return Promise.resolve();
};
