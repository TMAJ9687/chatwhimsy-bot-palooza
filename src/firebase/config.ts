
// This file is kept for backward compatibility during migration to Supabase
// All Firebase functionality is disabled and redirected to Supabase

// Mock implementations to avoid errors during the migration
const app = {} as any;
const auth = {} as any;
const db = {} as any;
const storage = {} as any;
const firestoreAvailable = false;
const firestoreBlocked = true;

// Helper to detect if connection was blocked - always returns true during migration
const detectFirestoreBlock = () => true;

// Export mock objects and flags
export { auth, db, storage, firestoreAvailable, firestoreBlocked, detectFirestoreBlock };
export default app;
