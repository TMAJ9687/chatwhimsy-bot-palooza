
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  DocumentData,
  WithFieldValue,
  FieldValue
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  makeSerializable, 
  serializeFirestoreData, 
  firebaseQueue 
} from '@/utils/serialization';

/**
 * Safe wrapper for Firestore document operations
 */
export const safeFirestore = {
  /**
   * Safely get document data
   */
  async getDoc<T>(docRef: DocumentReference<DocumentData>): Promise<T | null> {
    return firebaseQueue.add(async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        
        // Process data to ensure it's serializable
        const data = docSnap.data();
        return serializeFirestoreData<T>(data);
      } catch (error) {
        console.error('Error getting document:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Safely get collection data
   */
  async getDocs<T>(q: ReturnType<typeof query>): Promise<T[]> {
    return firebaseQueue.add(async () => {
      try {
        const querySnapshot = await getDocs(q);
        
        // Process each document to ensure data is serializable
        const results: T[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Create a proper object with the document ID and data
          const docData = {
            id: doc.id,
            ...(data as object) // Cast data to object type to ensure it can be spread
          };
          
          return serializeFirestoreData<T>(docData);
        });
        
        return results;
      } catch (error) {
        console.error('Error getting documents:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Safely add a document
   */
  async addDoc<T extends object>(collRef: CollectionReference<DocumentData>, data: WithFieldValue<T>): Promise<{ id: string }> {
    return firebaseQueue.add(async () => {
      try {
        // First use JSON serialization to guarantee serializability
        const jsonSafe = JSON.parse(JSON.stringify(data));
        
        // Then apply our custom serialization for any special types
        const safeData = makeSerializable(jsonSafe) as DocumentData;
        
        const docRef = await addDoc(collRef, safeData);
        return { id: docRef.id };
      } catch (error) {
        console.error('Error adding document:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Safely set a document
   */
  async setDoc<T extends object>(docRef: DocumentReference<DocumentData>, data: WithFieldValue<T>): Promise<void> {
    return firebaseQueue.add(async () => {
      try {
        // First use JSON serialization to guarantee serializability
        const jsonSafe = JSON.parse(JSON.stringify(data));
        
        // Then apply our custom serialization for any special types
        const safeData = makeSerializable(jsonSafe) as DocumentData;
        
        await setDoc(docRef, safeData);
      } catch (error) {
        console.error('Error setting document:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Safely update a document
   */
  async updateDoc<T extends object>(docRef: DocumentReference<DocumentData>, data: WithFieldValue<Partial<T>>): Promise<void> {
    return firebaseQueue.add(async () => {
      try {
        // First use JSON serialization to guarantee serializability
        const jsonSafe = JSON.parse(JSON.stringify(data));
        
        // Then apply our custom serialization for any special types
        const safeData = makeSerializable(jsonSafe) as DocumentData;
        
        await updateDoc(docRef, safeData);
      } catch (error) {
        console.error('Error updating document:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Safely delete a document
   */
  async deleteDoc(docRef: DocumentReference<DocumentData>): Promise<void> {
    return firebaseQueue.add(async () => {
      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting document:', error);
        throw makeSerializable(error);
      }
    });
  },
  
  /**
   * Create a query with safe handling
   */
  createQuery(collRef: CollectionReference<DocumentData>, ...constraints: QueryConstraint[]) {
    return query(collRef, ...constraints);
  },
  
  /**
   * Get a document reference
   */
  docRef(collectionPath: string, docPath?: string) {
    return docPath ? doc(db, collectionPath, docPath) : doc(collection(db, collectionPath));
  },
  
  /**
   * Get a collection reference
   */
  collectionRef(path: string) {
    return collection(db, path);
  }
};
