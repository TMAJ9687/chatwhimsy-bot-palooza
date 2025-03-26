
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ChatMessage {
  id?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  sender?: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
  timestamp?: Date | number;
}

export const sendMessage = async (chatId: string, messageData: {
  content: string;
  sender: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
}) => {
  try {
    const chatRef = collection(db, 'chats');
    const messageRef = await addDoc(chatRef, {
      chatId,
      content: messageData.content,
      sender: messageData.sender,
      isImage: messageData.isImage || false,
      status: messageData.status || 'sent',
      timestamp: serverTimestamp(),
    });
    
    return {
      id: messageRef.id,
      chatId,
      content: messageData.content,
      sender: messageData.sender,
      isImage: messageData.isImage || false,
      status: messageData.status || 'sent',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
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
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        content: doc.data().content || '',
        sender: doc.data().sender || 'system',
        isImage: !!doc.data().isImage,
        status: doc.data().status || 'sent',
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }))
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp) || 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp) || 0;
        return aTime - bTime;
      });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};
