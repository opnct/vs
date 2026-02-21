import { useEffect } from 'react';
import { saveChatMessage, subscribeToChatHistory } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

export const useChatHistory = (setMessages) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = subscribeToChatHistory(user.email, (fetchedMessages) => {
      if (fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      }
    });
    return () => unsubscribe();
  }, [user, setMessages]);

  const saveMessage = async (msg) => {
    if (user?.email) {
      await saveChatMessage(user.email, msg);
    }
  };

  return { saveMessage };
};
