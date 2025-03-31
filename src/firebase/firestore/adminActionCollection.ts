
import { v4 as uuidv4 } from 'uuid';

export interface AdminAction {
  id: string;
  actionType: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;  // Changed to string for consistency
  adminId: string;
  adminName: string;
  details: string;
  duration?: string;
}

export const logAdminAction = async (action: Partial<AdminAction>): Promise<AdminAction> => {
  // Generate a new ID if one wasn't provided
  const id = action.id || uuidv4();
  
  // Ensure timestamp is a string
  let timestamp = action.timestamp;
  if (!timestamp) {
    timestamp = new Date().toISOString();
  } else if (timestamp instanceof Date) {
    timestamp = timestamp.toISOString();
  }
  
  // Create the action object with all required fields
  const fullAction: AdminAction = {
    id,
    actionType: action.actionType || 'unknown',
    targetId: action.targetId,
    targetType: action.targetType,
    timestamp: timestamp,
    adminId: action.adminId || 'system',
    adminName: action.adminName || 'System',
    details: action.details || '',
    duration: action.duration
  };
  
  // Log to console for testing/debugging
  console.log('Admin action logged:', fullAction);
  
  return fullAction;
};

// Function to get admin actions (replace with actual implementation when needed)
export const getAdminActions = async (): Promise<AdminAction[]> => {
  // Simulated response - replace with actual implementation
  return [];
};
