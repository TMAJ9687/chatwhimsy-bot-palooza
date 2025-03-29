
// Re-export all firestore functionality from the modular files
export * from './utils';
export * from './botCollection';
export * from './banCollection';
export * from './adminActionCollection';
export * from './reportCollection';
export * from './userManagement';

// Import and re-export the uploadFile function from the correct path
import { uploadFile } from '../storage';
export { uploadFile };
