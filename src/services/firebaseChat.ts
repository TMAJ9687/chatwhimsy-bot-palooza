
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { makeSerializable, serializeFirestoreData } from '@/utils/serialization';

export interface ChatMessage {
  id?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  sender?: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
  timestamp?: Date | string | number;
}

export const sendMessage = async (chatId: string, messageData: {
  content: string;
  sender: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
}) => {
  try {
    // Make sure messageData is serializable
    const safeMessageData = makeSerializable(messageData);
    
    const chatRef = collection(db, 'chats');
    const messageRef = await addDoc(chatRef, {
      chatId,
      content: safeMessageData.content,
      sender: safeMessageData.sender,
      isImage: safeMessageData.isImage || false,
      status: safeMessageData.status || 'sent',
      timestamp: serverTimestamp(),
    });
    
    // Return a serializable result
    return makeSerializable({
      id: messageRef.id,
      chatId,
      content: safeMessageData.content,
      sender: safeMessageData.sender,
      isImage: safeMessageData.isImage || false,
      status: safeMessageData.status || 'sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw makeSerializable(error);
  }
};

// Helper function to safely convert Firestore document to our data type
const convertDocToMessage = (doc: QueryDocumentSnapshot<DocumentData>): ChatMessage => {
  const data = doc.data();
  
  // Standard properties that don't need special handling
  const result: ChatMessage = {
    id: doc.id,
    content: data.content || '',
    sender: (data.sender as 'user' | 'bot' | 'system') || 'system',
    isImage: !!data.isImage,
    status: data.status || 'sent',
  };
  
  // Special handling for timestamp
  if (data.timestamp) {
    if (data.timestamp.toDate && typeof data.timestamp.toDate === 'function') {
      // Firestore Timestamp
      try {
        result.timestamp = data.timestamp.toDate();
      } catch (e) {
        console.warn("Error converting timestamp", e);
        result.timestamp = new Date();
      }
    } else if (data.timestamp instanceof Date) {
      // Already a Date
      result.timestamp = data.timestamp;
    } else if (typeof data.timestamp === 'string') {
      // ISO string
      try {
        result.timestamp = new Date(data.timestamp);
      } catch (e) {
        console.warn("Error parsing timestamp string", e);
        result.timestamp = new Date();
      }
    } else if (typeof data.timestamp === 'number') {
      // Unix timestamp
      result.timestamp = new Date(data.timestamp);
    } else {
      // Default
      result.timestamp = new Date();
    }
  } else {
    result.timestamp = new Date();
  }
  
  return result;
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const chatRef = collection(db, 'chats');
    
    // Get messages where the chatId matches
    const q = query(
      chatRef, 
      where('chatId', '==', chatId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    // Convert documents to messages with safe handling
    const messages = snapshot.docs.map(doc => convertDocToMessage(doc));
    
    // Sort messages by timestamp
    const sortedMessages = messages.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 
                    typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : 
                    Number(a.timestamp) || 0;
      
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 
                    typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : 
                    Number(b.timestamp) || 0;
      
      return aTime - bTime;
    });
    
    // Return serializable result
    return makeSerializable(sortedMessages);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};
