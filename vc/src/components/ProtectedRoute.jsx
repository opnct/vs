import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(null); // null = checking, true = verified, false = blocked

  useEffect(() => {
    let isMounted = true;

    const checkUserVerification = async () => {
      // If no basic user object exists, fail instantly
      if (!user || !user.email) {
        if (isMounted) setIsVerified(false);
        return;
      }

      try {
        // Adaptive path generation (Ensures it works locally via Vite AND embedded Canvas)
        const collectionPath = typeof __app_id !== 'undefined' 
          ? `artifacts/${__app_id}/public/data/vyapar_profiles` 
          : 'vyapar_profiles';
        
        // Fetch the user's explicit profile document from Firestore
        const userRef = doc(db, collectionPath, user.email.trim().toLowerCase());
        const userSnap = await getDoc(userRef);

        // Strictly verify the OTP success flag exists and is true
        if (userSnap.exists() && userSnap.data().emailVerified === true) {
          if (isMounted) setIsVerified(true);
        } else {
          if (isMounted) setIsVerified(false);
        }
      } catch (error) {
        console.error("Failed to verify user profile status:", error);
        if (isMounted) setIsVerified(false);
      }
    };

    checkUserVerification();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 1. Base Check: If there is no authenticated user object, strictly prevent access.
  if (!user) {
    // Replace current history entry with login to prevent "back button" bypasses.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Database Check: Wait for Firestore to confirm the OTP verification flag
  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-[#337ab7] font-bold tracking-widest text-[13px] uppercase animate-pulse">
          Verifying Secure Session...
        </div>
      </div>
    );
  }

  // 3. Security Enforcement: If user is logged into Firebase but skipped OTP, kick them out
  if (isVerified === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Success: If the user passes both checks, render the intended secure component
  return children;
}