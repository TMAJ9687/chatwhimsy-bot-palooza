
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  QueryConstraint,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { timestampToDate } from './utils';

/**
 * Generic function to get documents from a collection
 */
export async function getDocumentsFromCollection<T>(
  collectionName: string, 
  transformDoc: (doc: DocumentData) => T
): Promise<T[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return transformDoc({
        ...data,
        id: doc.id
      });
    });
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    return []; // Return empty array as fallback
  }
}

/**
 * Generic function to get documents from a collection with query
 */
export async function queryDocumentsFromCollection<T>(
  collectionName: string, 
  queryConstraints: QueryConstraint[], 
  transformDoc: (doc: DocumentData) => T
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return transformDoc({
        ...data,
        id: doc.id
      });
    });
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    return []; // Return empty array as fallback
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(
  collectionName: string, 
  id: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return false;
  }
}

/**
 * Convert Firestore timestamp fields to JavaScript Date objects
 */
export function convertTimestampFields<T>(
  data: DocumentData, 
  timestampFields: string[]
): T {
  const result = { ...data } as any;
  
  for (const field of timestampFields) {
    if (data[field] && data[field] instanceof Timestamp) {
      result[field] = timestampToDate(data[field] as Timestamp);
    }
  }
  
  return result as T;
}

/**
 * Get a single document by ID
 */
export async function getDocumentById<T>(
  collectionName: string, 
  id: string,
  transformDoc: (doc: DocumentData) => T
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return transformDoc({
      ...docSnap.data(),
      id: docSnap.id
    });
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    return null;
  }
}
