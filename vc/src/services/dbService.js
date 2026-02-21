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

export const saveChatMessage = async (userEmail, message) => {
  if (!userEmail) return;
  try {
    const collectionName = `chats_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await addDoc(collection(db, collectionName), {
      ...message,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Firebase Save Error:", error);
  }
};

export const subscribeToChatHistory = (userEmail, callback) => {
  if (!userEmail) return () => {};
  const collectionName = `chats_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const q = query(collection(db, collectionName), orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  }, (error) => {
    console.error("Firebase Fetch Error:", error);
  });
};