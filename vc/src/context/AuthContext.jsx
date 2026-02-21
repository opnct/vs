import React, { createContext, useContext, useState } from 'react';
import { sendOTP } from '../services/emailService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vyapar_user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to parse user session:", error);
      return null;
    }
  });
  
  const [tempEmail, setTempEmail] = useState(null);
  
  // Storing OTP as an object containing the code and an strict expiration timestamp
  const [otpData, setOtpData] = useState(null);

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
      // Build authenticated user object
      const newUser = { 
        email: tempEmail,
        authenticatedAt: new Date().toISOString()
      };
      
      // Persist to local state & browser storage
      setUser(newUser);
      localStorage.setItem('vyapar_user', JSON.stringify(newUser));
      
      // Security: Purge sensitive temporary data from memory immediately after success
      setTempEmail(null);
      setOtpData(null);
      
      return true;
    }

    // 4. Failure state
    throw new Error('Invalid access code. Please verify and try again.');
  };

  const logout = () => {
    // Destroy all memory and persistent storage traces
    setUser(null);
    setTempEmail(null);
    setOtpData(null);
    localStorage.removeItem('vyapar_user');
  };

  return (
    <AuthContext.Provider value={{ user, initiateLogin, verifyOTP, logout, tempEmail }}>
      {children}
    </AuthContext.Provider>
  );
};