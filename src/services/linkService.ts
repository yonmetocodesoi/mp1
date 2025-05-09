import { ref, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';
import { v4 as uuidv4 } from 'uuid';

interface LinkData {
  userId: string;
  createdAt: number;
  url: string;
}

interface LinkAccess {
  linkId: string;
  timestamp: number;
  ip?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  userAgent?: string;
  device?: string;
}

export const generateLink = async (userId: string) => {
  if (!userId) {
    throw new Error('User must be authenticated to generate links');
  }

  const uniqueId = uuidv4();
  const linkId = `${uniqueId}_${userId}`;
  const linkRef = ref(database, `links/${linkId}`);
  
  const linkData: LinkData = {
    userId,
    createdAt: Date.now(),
    url: `${window.location.origin}/track/${linkId}`
  };
  
  try {
    await set(linkRef, linkData);
    return linkData.url;
  } catch (error) {
    console.error('Error generating link:', error);
    throw error;
  }
};

export const trackLinkAccess = async (linkId: string, accessData: Omit<LinkAccess, 'linkId' | 'timestamp'>) => {
  const accessRef = ref(database, `accesses/${linkId}/${Date.now()}`);
  const data: Omit<LinkAccess, 'linkId'> = {
    timestamp: Date.now(),
    ...accessData
  };
  
  await set(accessRef, data);
};

export const getLinkAccesses = (userId: string, callback: (data: LinkAccess[]) => void) => {
  if (!userId) {
    callback([]);
    return;
  }

  // Query links owned by the user
  const userLinksRef = query(
    ref(database, 'links'),
    orderByChild('userId'),
    equalTo(userId)
  );
  
  onValue(userLinksRef, (snapshot) => {
    const linksData = snapshot.val();
    if (!linksData) {
      callback([]);
      return;
    }
    
    const linkIds = Object.keys(linksData);
    const allAccesses: LinkAccess[] = [];
    
    // For each link, get its accesses
    linkIds.forEach(linkId => {
      const linkAccessesRef = ref(database, `accesses/${linkId}`);
      
      onValue(linkAccessesRef, (accessSnapshot) => {
        const accessesData = accessSnapshot.val();
        
        if (accessesData) {
          Object.entries(accessesData).forEach(([timestamp, data]) => {
            allAccesses.push({
              linkId,
              timestamp: Number(timestamp),
              ...data as Omit<LinkAccess, 'linkId' | 'timestamp'>
            });
          });
        }
        
        // Sort accesses by timestamp (newest first)
        allAccesses.sort((a, b) => b.timestamp - a.timestamp);
        
        callback(allAccesses);
      });
    });
  });
};