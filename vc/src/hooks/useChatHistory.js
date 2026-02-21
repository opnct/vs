import { useEffect, useCallback } from 'react';
import { saveChatMessage, subscribeToChatHistory } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

export const useChatHistory = (setMessages) => {
  const { user } = useAuth();

  useEffect(() => {
    // If there's no authenticated user, strictly clear local memory and do not fetch
    if (!user?.email) {
      setMessages([]);
      return;
    }

    // Subscribe to real-time updates from Firebase Firestore
    const unsubscribe = subscribeToChatHistory(user.email, (fetchedMessages) => {
      // Sync local state directly with the remote database state
      setMessages(fetchedMessages || []);
    });

    // Cleanup the Firestore listener securely when the component unmounts or user changes
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.email, setMessages]); // Optimized dependency array

  // Memoize the save function to prevent unnecessary re-renders in the Chatbot component
  const saveMessage = useCallback(async (msg) => {
    // 1. Validate Authentication State
    if (!user?.email) {
      console.warn("SECURITY_WARN: Attempted to save message without an authenticated session.");
      return;
    }
    
    // 2. Validate Payload Integrity
    if (!msg || !msg.content || !msg.role) {
      console.warn("DATA_WARN: Attempted to save an invalid message payload to database.");
      return;
    }

    try {
      // 3. Execute Real Database Transaction
      await saveChatMessage(user.email, msg);
    } catch (error) {
      console.error("Failed to persist message to secure chat history:", error);
      throw error; // Rethrow to allow the UI to catch and display the error
    }
  }, [user?.email]);

  return { saveMessage };
};