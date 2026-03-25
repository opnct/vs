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
  const [isVerified, setIsVerified] = useState(null); // null = checking, 'VERIFIED' = allowed, 'UNAUTHORIZED' = login blocked, 'PENDING_CLEARANCE' = SA blocked

  useEffect(() => {
    let isMounted = true;

    const checkUserVerification = async () => {
      // If no basic user object exists, fail instantly
      if (!user || !user.email) {
        if (isMounted) setIsVerified('UNAUTHORIZED');
        return;
      }

      try {
        const email = user.email.trim().toLowerCase();

        // 1. PRIMARY SECURITY LAYER: Check Super Admin Approvals (HITL)
        const approvalPath = typeof __app_id !== 'undefined'
          ? `artifacts/${__app_id}/public/data/vyapar_approvals`
          : 'vyapar_approvals';
        
        const approvalRef = doc(db, approvalPath, email);
        const approvalSnap = await getDoc(approvalRef);

        // If the user's email is not explicitly in the SA approved list, block access instantly.
        if (!approvalSnap.exists()) {
          if (isMounted) setIsVerified('PENDING_CLEARANCE');
          return;
        }

        // 2. SECONDARY SECURITY LAYER: Adaptive path generation for Profile & OTP verification
        const collectionPath = typeof __app_id !== 'undefined' 
          ? `artifacts/${__app_id}/public/data/vyapar_profiles` 
          : 'vyapar_profiles';
        
        // Fetch the user's explicit profile document from Firestore
        const userRef = doc(db, collectionPath, email);
        const userSnap = await getDoc(userRef);

        // Strictly verify the OTP success flag exists and is true
        if (userSnap.exists() && userSnap.data().emailVerified === true) {
          if (isMounted) setIsVerified('VERIFIED');
        } else {
          if (isMounted) setIsVerified('UNAUTHORIZED');
        }
      } catch (error) {
        console.error("Failed to verify user security status:", error);
        if (isMounted) setIsVerified('UNAUTHORIZED');
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

  // 2. Database Check: Wait for Firestore to confirm the OTP verification & SA clearance
  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-[#337ab7] font-bold tracking-widest text-[13px] uppercase animate-pulse">
          Verifying Security Clearance & Identity...
        </div>
      </div>
    );
  }

  // 3. Security Enforcement: Clearance Pending (Super Admin blocked)
  if (isVerified === 'PENDING_CLEARANCE') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center font-sans p-6 text-center text-white selection:bg-red-500 selection:text-white">
        <div className="max-w-md border-t-[8px] border-[#005ea2] bg-black p-10 shadow-2xl border border-[#333]">
          <h1 className="text-3xl font-black uppercase mb-4 text-red-500 tracking-tighter leading-none">Access Denied</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed text-[15px] font-light">
            Your account lacks the necessary Super Admin security clearance. If you recently submitted a subscription payment, it is currently in the Human-in-the-Loop verification queue.
          </p>
          <div className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-8 border-b border-[#333] pb-6">
            Expected Clearance SLA: 2-4 Hours
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-[#005ea2] text-white font-bold py-4 px-8 text-[11px] uppercase tracking-[0.3em] hover:bg-[#0b4774] transition-colors w-full"
          >
            Return to Safepoint
          </button>
        </div>
      </div>
    );
  }

  // 4. Security Enforcement: If user is logged into Firebase but skipped OTP/Profile creation, kick them out
  if (isVerified === 'UNAUTHORIZED' || isVerified === false) {
    return <Navigate to="/login2" state={{ from: location }} replace />;
  }

  // 5. Success: If the user passes ALL checks, render the intended secure component
  return children;
}