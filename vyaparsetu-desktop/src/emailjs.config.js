import emailjs from '@emailjs/browser';

/**
 * Generates a random 6-digit One Time Password (OTP)
 * @returns {string} 6-digit numeric string
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends the OTP to the provided email using EmailJS
 * @param {string} userEmail - The email address to send the OTP to
 * @param {string} shopName - The name of the Kirana store for personalization
 * @param {string} otpCode - The generated 6-digit code
 * @returns {Promise<{success: boolean, response?: any, error?: any}>}
 */
export const sendOTP = async (userEmail, shopName, otpCode) => {
  // Pull credentials from Vite environment securely
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("Missing EmailJS environment variables! Check your .env file.");
    return { success: false, error: "Missing EmailJS configuration." };
  }

  // These keys MUST match the {{variables}} exactly in your EmailJS template
  const templateParams = {
    to_email: userEmail,
    shop_name: shopName || "Shop Owner",
    otp: otpCode,
  };

  try {
    const response = await emailjs.send(
      serviceId, 
      templateId, 
      templateParams, 
      publicKey
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Send Error:', error);
    return { success: false, error };
  }
};