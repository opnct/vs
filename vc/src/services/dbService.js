import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Ensure you add these keys to your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "dummy"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to dynamically generate secure, rule-compliant paths
const getChatCollectionPath = (userEmail) => {
  const safeEmail = userEmail.trim().toLowerCase();
  // Adaptive path generation (Ensures it works locally via Vite AND embedded Canvas)
  return typeof __app_id !== 'undefined' 
    ? `artifacts/${__app_id}/public/data/vyapar_chats/${safeEmail}/messages` 
    : `vyapar_chats/${safeEmail}/messages`;
};

export const saveChatMessage = async (userEmail, message) => {
  if (!userEmail) return;
  try {
    const collectionPath = getChatCollectionPath(userEmail);
    
    await addDoc(collection(db, collectionPath), {
      ...message,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Firebase Save Error:", error);
  }
};

export const subscribeToChatHistory = (userEmail, callback) => {
  if (!userEmail) return () => {};
  
  const collectionPath = getChatCollectionPath(userEmail);
  const q = query(collection(db, collectionPath), orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  }, (error) => {
    console.error("Firebase Fetch Error:", error);
  });
};