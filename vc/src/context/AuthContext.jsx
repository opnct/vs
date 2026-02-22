import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendOTP } from '../services/emailService';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

// Initialize Firebase securely utilizing environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // User state is now strictly initialized as null. 
  // Firebase listener will act as the Single Source of Truth.
  const [user, setUser] = useState(null);
  const [tempEmail, setTempEmail] = useState(null);
  
  // Storing OTP as an object containing the code and an strict expiration timestamp
  const [otpData, setOtpData] = useState(null);

  // Securely listen for server-side auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Sync Firebase session to local context
        setUser({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          authenticatedAt: new Date().toISOString()
        });
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const initiateLogin = async (email) => {
    // Generate a strictly random 6-digit cryptographic code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set absolute expiration time to exactly 5 minutes (300,000 ms) from creation
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Dispatch real email via EmailJS Service
    await sendOTP(email, otp);
    
    // Mount temporary session data into memory
    setTempEmail(email);
    setOtpData({ code: otp, expiresAt });
  };

  const verifyOTP = (enteredOTP) => {
    // 1. Validate Session Existence
    if (!otpData || !tempEmail) {
      throw new Error('No active login session found. Please request a new code.');
    }

    // 2. Validate Time-to-Live (TTL) - 5 Minute strict cutoff
    if (Date.now() > otpData.expiresAt) {
      setOtpData(null); // Purge expired OTP from memory instantly
      throw new Error('Access code has expired. Please request a new one.');
    }

    // 3. Strict Equality Check
    if (enteredOTP === otpData.code) {
      // We no longer set localStorage here. Firebase onAuthStateChanged handles the session.
      // Security: Purge sensitive temporary data from memory immediately after success
      setTempEmail(null);
      setOtpData(null);
      
      return true;
    }

    // 4. Failure state
    throw new Error('Invalid access code. Please verify and try again.');
  };

  const logout = async () => {
    try {
      // Execute official Firebase server-side session termination
      await signOut(auth);
      
      // Destroy all memory traces
      setUser(null);
      setTempEmail(null);
      setOtpData(null);
    } catch (error) {
      console.error("Failed to execute secure logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, initiateLogin, verifyOTP, logout, tempEmail }}>
      {children}
    </AuthContext.Provider>
  );
};